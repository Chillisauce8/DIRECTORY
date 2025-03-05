import {DateHelper} from 'x-utils';
import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {coreServiceLocator} from '../serviceLocator';
import {KnownCurrencyCode} from './currency';
import axios from 'axios';


const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');
const dateHelper = new DateHelper();


const collectionName = 'exchangeRates';


interface ExchangeRateInfo {
  base: 'USD';
  date: string;
  rates: Record<KnownCurrencyCode, number>
}


export async function storeExchangeRateForToday(req: Request): Promise<void> {
  const date = getTodayDate();

  const existingNode = await getExchangeRateForDate(req, date);

  if (existingNode) {
    console.log('exchange rates already exists');
    return;
  }

  const exchangeRateNode = await loadExchangeRateInfoAndCreateNode(req, date);

  if (!exchangeRateNode) {
    console.error('exchangeRates:', 'something went wrong', date);
    return;
  }

  console.log('exchangeRates:', `created for ${date} (${exchangeRateNode?._doc})`);
}


export async function populateExchangeRatesCollection(req: Request): Promise<void> {
  const defaultDate = '1999-01-01'
  const lastExchangeRateDate = await getLatestExchangeRateDate(req);

  let date = getNextDateDate(lastExchangeRateDate) ?? defaultDate;

  const todayData = getTodayDate();

  do {
    const exchangeRateNode = await loadExchangeRateInfoAndCreateNode(req, date);

    if (!exchangeRateNode) {
      console.error('exchangeRates:', 'something went wrong', date);
      return;
    }

    console.log('exchangeRates:', `created for ${date} (${exchangeRateNode._doc})`);

    date = getNextDateDate(date);
  } while (date <= todayData);
}


async function loadExchangeRateInfoAndCreateNode(req: Request, date: string): Promise<any> {
  const exchangeRateInfo = await fetchExchangeRatesForDate(date);

  if (!exchangeRateInfo) {
    return null;
  }

  const {rates} = exchangeRateInfo;

  const currency = Object.entries(rates)
    .map(([code, rate]) => ({code, rate}));

  const exchangeRateNode = await dataCrudService.createNode(req, collectionName, {date, currency});

  return exchangeRateNode;
}


function getNextDateDate(date: string): string {
  if (!date) {
    return null;
  }

  const nextDayDate = dateHelper.getDateInNDays(dateHelper.parseSaveDateFormat(date), 1);

  return dateHelper.saveDateFormat(nextDayDate);
}


async function fetchExchangeRatesForDate(date: string): Promise<ExchangeRateInfo> {
  const url = `https://data.fixer.io/api/${date}?access_key=3e9f94a052348b31b20fdab9dd0b0b0a&base=USD`;

  return axios({method: 'get', url})
    .then(r => r.data)
    .catch(() => null);
}


async function getExchangeRateForDate(req: Request, date: string): Promise<any> {
  return dataCrudService.querySingleNode(req, collectionName, {
    query: {
      date
    }
  });
}


async function getLatestExchangeRateDate(req: Request): Promise<string> {
  let pagination = {skip: 0, limit: 1, sort: {date: -1}};

  const latestCreatedExchangeRateList = await dataCrudService.queryNodes(req, collectionName, {
    pagination
  });

  return latestCreatedExchangeRateList?.[0]?.date;
}


function getTodayDate(): string {
  return dateHelper.saveDateFormat(new Date());
}
