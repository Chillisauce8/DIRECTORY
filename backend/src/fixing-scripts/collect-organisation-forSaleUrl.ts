import {DataCrudWithRelators} from '../db/data-crud-with-relators';
import {coreServiceLocator} from '../serviceLocator';
import {apifyHelperFactory} from '../utils/apify-helper';


interface Organisation {
  _doc?: string;
  website?: string;
  loadedUrl?: string;
  status?: 'Bad' | 'Ok';
  salePages?: {
    forSalePage?: string;
  }
}


const collection = 'organisations';
const kvsName = 'cars-websites-data';


const apifyHelper = apifyHelperFactory();
const dataCrudService: DataCrudWithRelators = coreServiceLocator.get('dataCrudService');


export async function collectOrganisationForSaleUrl(req: Request) {
  const typeList = [
    'Online Marketplace',
    'Club',
    'Dealer',
    'Restorer',
    'Parts Supplier',
    'Registry',
    'Transporter',
    'Insurer',
    'Event Organiser',
  ];

  const organisationList: Organisation[] = await dataCrudService.queryAllAvailableNodes(req, collection, {
    query: {
      status: 'Ok',
      type: {$in: typeList},
      'salePages.forSalePage': {$exists: true},
      _fields: {
        '_doc': 1,
        'website': 1,
        'loadedUrl': 1,
        'salePages': 1,
        'status': 1,
      },
    }
  });

  const preparedList = organisationList
    .filter(i => i.status === 'Ok')
    .filter(i => !!i?.salePages?.forSalePage)
    .filter(i => i.salePages.forSalePage.startsWith('/') || i.salePages.forSalePage.startsWith('http'))
    .map(({_doc, website, loadedUrl, salePages: {forSalePage}}) => {
      if (forSalePage.startsWith('/')) {
        forSalePage = (new URL(forSalePage, loadedUrl ?? website)).toString();
      }

      return {_doc, website, loadedUrl, forSalePage};
    });


  const kvs = await apifyHelper.getKeyValueStoreByName(kvsName);

  await kvs.setRecord({key: 'organisation-for-sale-page', value: preparedList});

  console.log('Done')
}

function getURLHostname(url: URL) {
  return url.hostname.replace('www.', '');
}
