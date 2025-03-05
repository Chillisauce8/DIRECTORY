import axios from 'axios';
import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {coreServiceLocator} from '../serviceLocator';
import {COUNTRY_INFO_LIST} from './countries';
const cheerio = require('cheerio');

interface CountryDetail {
  name: string;
  code: string;
  flag: string;
}


interface CurrencyDetail {
  countryName: string;
  code: string;
  symbol: string;
  name: string;
}


interface CurrencyDetail2 {
  countryAndCurrencyName: string;
  code: string;
  symbol: string;
}


interface Country {
  name: string;
  code: string;
  currencyCode: string;
  currencySymbol: string;
  flag: string;
}


const countriesCollectionName = 'countries';


const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');


export async function getCountryCodeToMapSvg(req: Request): Promise<Record<string, string>> {
  const nodeList: Pick<Country, 'code' | 'flag'>[] = await dataCrudService.queryAllAvailableNodes(req, countriesCollectionName, {query: {
      _fields: {code: 1, flag: 1}
    }
  });

  return nodeList.reduce((res, country) => {
    const {code, flag} = country;

    res[code.toLowerCase()] = flag;

    return res;
  }, {});
}


export async function populateCountryCollection(req: Request) {
  const countryNodeList: Country[] = await dataCrudService.queryAllAvailableNodes(req, countriesCollectionName, {});

  for (const country of countryNodeList) {
    if (country.currencyCode) {
      continue;
    }

    const {name, code, flag} = country;

    const countryInfo = COUNTRY_INFO_LIST.find(i => i.code === code);

    const currencyDetail = countryInfo?.currency;

    if (!currencyDetail) {
      console.log(`Currency for ${name} is not found`);

      continue;
    }

    const {code: currencyCode, symbol: currencySymbol} = currencyDetail ?? {};

    const updatedCountryNode = {...country, currencyCode, currencySymbol};

    const savedCountryNode = await dataCrudService.updateNode(req, countriesCollectionName, updatedCountryNode);

    console.log(`Updated ${savedCountryNode.name} (${savedCountryNode._doc})`);
  }
}


async function loadCountryList(): Promise<CountryDetail[]> {
  const url = 'https://catamphetamine.gitlab.io/country-flag-icons/3x2/';

  const pageContentResponse = await axios({
    method: 'get',
    url,
  });

  const html = pageContentResponse.data;

  const $ = cheerio.load(html);

  const countryItemList = [];

  $('.Country a.CountryFlagLink img').each((i, elem) => {
    const item = $(elem);

    const countryName = item.first().attr('title');
    const flagIconPath = item.first().attr('src');
    const countryCode = flagIconPath.split('/')[1].split('.')[0];

    countryItemList.push({
      name: countryName,
      code: countryCode,
      flag: null,
      flagUrl: `https://catamphetamine.gitlab.io/country-flag-icons/3x2/${flagIconPath.split('/')[1]}`
    });
  });

  for (const countryItem of countryItemList) {
    const flagSvgUrl = countryItem.flagUrl;
    const flagSvg = await axios({method: 'get', url: flagSvgUrl}).then(r => r.data);

    countryItem.flag = flagSvg;
  }

  return countryItemList;
}
