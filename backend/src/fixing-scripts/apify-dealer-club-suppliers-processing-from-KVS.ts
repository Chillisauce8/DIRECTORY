import {apifyHelperFactory, ApifyKeyValueStoreRecord} from '../utils/apify-helper';


const apifyHelper = apifyHelperFactory();
const kvsName = 'cars-websites-data';


interface MultiSourceDataItem<Data extends unknown> {
  source: string;
  data: Data;
}


type MultiSourceData<Data extends unknown> = MultiSourceDataItem<Data>[];


type CarAssociationType = 'dealer' | 'club' | 'supplier';


interface ClubOfficial {
  role: string;
  name: string;
}


interface CarAssociationMainDetails {
  type: CarAssociationType;
  website?: string;
  name: MultiSourceData<string>;
  logoUrl?: MultiSourceData<string>;
}


interface CarAssociationContactDetails {
  phone?: MultiSourceData<string>;
  email?: MultiSourceData<string>;
  socialMediaList?: MultiSourceData<string>;
  contactName?: MultiSourceData<string>;
  officials?: MultiSourceData<ClubOfficial>;
}


interface CarAssociationLocationDetails {
  location?: MultiSourceData<string>;
  address?: MultiSourceData<string>;
  country?: MultiSourceData<string>;
  city?: MultiSourceData<string>;
  state?: MultiSourceData<string>;
  zip?: MultiSourceData<string>;
  region?: MultiSourceData<string>;
}


interface CarAssociationSpecialtyDetails {
  make?: MultiSourceData<string>;
  model?: MultiSourceData<string>;
  speciality?: MultiSourceData<string>;
  categories?: MultiSourceData<string>;
  tags?: MultiSourceData<string>;
}


interface CarAssociationAdditionalDetails {
  description?: MultiSourceData<string>; // aboutUs
  activities?: MultiSourceData<string>;
  dues?: MultiSourceData<string>;
  yearFounded?: MultiSourceData<string>; // established
  numberOfYearlyEvents?: MultiSourceData<string>;
  numberOfMembers?: MultiSourceData<string>;
  clubType?: MultiSourceData<string>;
  clubSpecialty?: MultiSourceData<string>;
  membershipRestrictions?: MultiSourceData<string>;
  meetingSchedule?: MultiSourceData<string>;
  clubPublication?: MultiSourceData<string>;
  frequency?: MultiSourceData<string>;
  years?: MultiSourceData<string>;
}


interface CarAssociationInfoItem {
  title: string;
  value: string;
}


interface CarAssociation extends CarAssociationMainDetails,
                                 CarAssociationContactDetails,
                                 CarAssociationLocationDetails,
                                 CarAssociationSpecialtyDetails,
                                 CarAssociationAdditionalDetails {
  info?: MultiSourceDataItem<CarAssociationInfoItem[]>
}


const KVSKeyToDomainMap = {
  'aussiemotoring-com': 'aussiemotoring.com',
  'bundanoonmotel-com-au': 'bundanoonmotel.com.au',
  'carandclassic-com': 'carandclassic.com',
  'carownersclubs-co-uk': 'carownersclubs.co.uk',
  'classic-com': 'classic.com',
  'classic-trader-com': 'classic-trader.com',
  'classicandsportscar-com': 'classicandsportscar.com',
  'classiccaradvisor-com': 'classiccaradvisor.com',
  'classiccarcommunity-com': 'classiccarcommunity.com',
  'classiccarpassion-com': 'classiccarpassion.com',
  'dyler-com': 'dyler.com',
  'exchangeandmart-co-uk': 'exchangeandmart.co.uk',
  'fbhvc-co-uk': 'fbhvc.co.uk',
  'fhmcsa-org-au': 'fhmcsa.org.au',
  'fomc-nz': 'fomc.nz',
  'mikebrewermotoring-com': 'mikebrewermotoring.com',
  'motorsportuk-org': 'motorsportuk.org',
  'oldride-com': 'oldride.com',
  'shannons-com-au': 'shannons.com.au',
  'superclassics-eu': 'superclassics.eu'
};


type KVSKeys = keyof typeof KVSKeyToDomainMap;


type DataSource = typeof KVSKeyToDomainMap[KVSKeys];


export async function processApifyDealerClubSupplierRecords() {
  const kvsRecordList = await loadValuesFromKVS();

  const carAssociationList = [];

  for (const record of kvsRecordList) {
    const kvsStoreKey = record.key;
    if (['classiccarcommunity-com-clubs', 'classiccarpassion-com-clubs'].includes(kvsStoreKey)) {
      continue;
    }

    const detailList = record.value;

    for (const detail of detailList) {
      const website = parseWebsiteDomain(detail);
      const existingNode = website ? carAssociationList.find(i => i.website === website) : null;

      const data = prepareData(kvsStoreKey, detail, existingNode);

      if (!data) {
        continue;
      }

      if (existingNode) {
        carAssociationList.splice(carAssociationList.indexOf(existingNode), 1, data);
      } else {
        carAssociationList.push(data);
      }
    }
  }

  const clearedCarAssociationList = carAssociationList.map(data => {
    const preparedData = Object.entries(data)
      .filter(([key, value]) => {
        if (!value) {
          return false;
        }

        if (Array.isArray(value) && !value.length) {
          return false;
        }

        return true;
      })
      .reduce((res, [key, value]) => {
        if (Array.isArray(value)) {
          const valueWithUniqItems = [];

          value.forEach(i => {
            if (typeof i.data !== 'string') {
              valueWithUniqItems.push(i);
              return;
            }

            const searchData = i?.data?.toLowerCase();

            const similarData = valueWithUniqItems.find(v => v?.data?.toLowerCase() === searchData);

            if (similarData) {
              return;
            }

            valueWithUniqItems.push(i);
          });

          if (valueWithUniqItems.length !== value.length) {
            value = valueWithUniqItems;
          }
        }

        if (Array.isArray(value) && ['socialMediaList', 'tags'].includes(key)) {
          res[key] = value.map(i => i.data);
        } else if (Array.isArray(value) && value.length === 1) {
          res[key] = value[0]?.data;
        } else {
          res[key] = value;
        }

        return res;
      }, {});

    return preparedData as CarAssociation;
  });


  // await apifyHelper.storeDataInKVS(kvsName, 'car-associations', clearedCarAssociationList);
}


async function loadValuesFromKVS() {
  return apifyHelper.loadRecordsFromApifyKVS({
    keyValueStoreName: kvsName,
    keyFilter: keyName => ['-clubs', '-suppliers', '-dealers'].some(suffix => keyName.endsWith(suffix)),
  });
}


function collectKeysSpecificForWebsite(recordList: ApifyKeyValueStoreRecord<any[]>[]) {
  const result = [];

  for (const record of recordList) {
    const {key: actorName, value: itemList} = record;

    result.push({actorName, keys: collectUniqueKeysFromObjectList(itemList)});
  }

  return result;
}


function collectUniqueKeysFromObjectList(list: any[]): string[] {
  const result = [];

  for (const item of list) {
    const keys = Object.keys(item);

    keys.forEach(key => result.includes(key) ? null : result.push(key));
  }

  return result;
}


function prepareData(keyValueStoreName: string,
                     associationDetails: any,
                     existingCarAssociation: CarAssociation): CarAssociation {
  const mainData = prepareMainData(keyValueStoreName, associationDetails, existingCarAssociation);

  if (!mainData) {
    return null;
  }

  const contactDetails = prepareCarAssociationContactDetailsCollector(
    keyValueStoreName,
    associationDetails,
    existingCarAssociation,
  );

  const locationDetails = prepareCarAssociationLocationDetails(
    keyValueStoreName,
    associationDetails,
    existingCarAssociation,
  );

  const specialtyDetails = prepareCarAssociationSpecialtyDetails(
    keyValueStoreName,
    associationDetails,
    existingCarAssociation,
  );

  const additionalDetails = prepareCarAssociationAdditionalDetails(
    keyValueStoreName,
    associationDetails,
    existingCarAssociation,
  );

  const data = {
    ...mainData,
    ...contactDetails,
    ...locationDetails,
    ...specialtyDetails,
    ...additionalDetails,
  };

  return data;
}


function prepareCarAssociationAdditionalDetails(keyValueStoreName: string,
                                                associationDetails: any,
                                                existingCarAssociation: CarAssociation): CarAssociationAdditionalDetails {
  const description = associationDetails?.description ?? associationDetails?.aboutUs;
  const activities = getActivitiesFromClubInformation(associationDetails);
  const yearFounded = associationDetails?.yearFounded ??
    getDataFromClubInformation(associationDetails, 'established');
  const clubType = associationDetails?.type ?? associationDetails?.clubType ??
    getDataFromClubInformation(associationDetails, 'club type')

  return {
    description: processMultiSourceDataField(description, existingCarAssociation?.description, keyValueStoreName),
    activities: processMultiSourceDataField(activities, existingCarAssociation?.activities, keyValueStoreName),
    dues: processMultiSourceDataField(associationDetails?.dues, existingCarAssociation?.dues, keyValueStoreName),
    yearFounded: processMultiSourceDataField(yearFounded, existingCarAssociation?.yearFounded, keyValueStoreName),
    numberOfYearlyEvents: processMultiSourceDataField(associationDetails?.numberOfYearlyEvents, existingCarAssociation?.numberOfYearlyEvents, keyValueStoreName),
    numberOfMembers: processMultiSourceDataField(associationDetails?.numberOfMembers, existingCarAssociation?.numberOfMembers, keyValueStoreName),
    clubType: processMultiSourceDataField(clubType, existingCarAssociation?.clubType, keyValueStoreName),
    clubSpecialty: processMultiSourceDataField(associationDetails?.clubSpecialty, existingCarAssociation?.clubSpecialty, keyValueStoreName),
    membershipRestrictions: processMultiSourceDataField(associationDetails?.membershipRestrictions, existingCarAssociation?.membershipRestrictions, keyValueStoreName),
    meetingSchedule: processMultiSourceDataField(associationDetails?.meetingSchedule, existingCarAssociation?.meetingSchedule, keyValueStoreName),
    clubPublication: processMultiSourceDataField(associationDetails?.clubPublication, existingCarAssociation?.clubPublication, keyValueStoreName),
    frequency: processMultiSourceDataField(associationDetails?.frequency, existingCarAssociation?.frequency, keyValueStoreName),
    years: processMultiSourceDataField(associationDetails?.years, existingCarAssociation?.years, keyValueStoreName),
  }
}


function prepareCarAssociationSpecialtyDetails(keyValueStoreName: string,
                                               associationDetails: any,
                                               existingCarAssociation: CarAssociation): CarAssociationSpecialtyDetails {
  return {
    make: processMultiSourceDataField(associationDetails?.make, existingCarAssociation?.make, keyValueStoreName),
    model: processMultiSourceDataField(associationDetails?.model, existingCarAssociation?.model, keyValueStoreName),
    speciality: processMultiSourceDataField(associationDetails?.speciality, existingCarAssociation?.speciality, keyValueStoreName),
    categories: processMultiSourceDataField(associationDetails?.categories, existingCarAssociation?.categories, keyValueStoreName),
    tags: processMultiSourceDataField(associationDetails?.tags, existingCarAssociation?.tags, keyValueStoreName),
  };
}


function prepareCarAssociationLocationDetails(keyValueStoreName: string,
                                              associationDetails: any,
                                              existingCarAssociation: CarAssociation): CarAssociationLocationDetails {
  return {
    location: processMultiSourceDataField(associationDetails?.location, existingCarAssociation?.location, keyValueStoreName),
    address: processMultiSourceDataField(associationDetails?.address, existingCarAssociation?.address, keyValueStoreName),
    country: processMultiSourceDataField(associationDetails?.country, existingCarAssociation?.country, keyValueStoreName),
    city: processMultiSourceDataField(associationDetails?.city, existingCarAssociation?.city, keyValueStoreName),
    state: processMultiSourceDataField(associationDetails?.state, existingCarAssociation?.state, keyValueStoreName),
    zip: processMultiSourceDataField(associationDetails?.zip, existingCarAssociation?.zip, keyValueStoreName),
    region: processMultiSourceDataField(associationDetails?.region, existingCarAssociation?.region, keyValueStoreName),
  }
}


function prepareMainData(keyValueStoreName: string,
                         associationDetails: any,
                         existingCarAssociation: CarAssociation): CarAssociationMainDetails {
  const website = parseWebsiteDomain(associationDetails);

  if (!website) {
    return null;
  }

  const logoUrlFromDetails = associationDetails?.logoUrl ?? associationDetails?.logo;

  return {
    type: getCarAssociationType(keyValueStoreName),
    website,
    name: processMultiSourceDataField(associationDetails?.name, existingCarAssociation?.name, keyValueStoreName),
    logoUrl: processMultiSourceDataField(logoUrlFromDetails, existingCarAssociation?.logoUrl, keyValueStoreName)
  }
}


function parseWebsiteDomain(associationDetails: any): string {
  const website = associationDetails?.website ?? '';

  if (!website) {
    return null;
  }

  if (!website.startsWith('http')) {
    return null;
  }
  try {
    const url = new URL(website);

    return `${url.protocol}//${url.hostname}`
  } catch (e) {
    console.log('Parse domain problems -', website);

    return null;
  }
}


function prepareCarAssociationContactDetailsCollector(keyValueStoreName: string,
                                                      associationDetails: any,
                                                      existingCarAssociation: CarAssociation): CarAssociationContactDetails {

  const phone = associationDetails?.phone ?? associationDetails.contactPhone;
  const email = associationDetails?.email ??
    associationDetails.contactEmail ??
    getEmailFromClubInformation(associationDetails);
  const contactName = associationDetails?.contact ?? associationDetails?.contactName;
  const officials = getOfficialsFromDetails(associationDetails);
  const socialMediaList = [];

  if (associationDetails?.facebook) {
    socialMediaList.push(associationDetails.facebook);
  }

  if (associationDetails?.socials) {
    socialMediaList.push(...associationDetails.socials);
  }

  return {
    phone: processMultiSourceDataField(phone, existingCarAssociation?.phone, keyValueStoreName),
    email: processMultiSourceDataField(email, existingCarAssociation?.email, keyValueStoreName),
    contactName: processMultiSourceDataField(contactName, existingCarAssociation?.contactName, keyValueStoreName),
    officials: processMultiSourceDataField(officials, existingCarAssociation?.officials, keyValueStoreName),
    socialMediaList: processMultiSourceDataField(socialMediaList, existingCarAssociation?.socialMediaList, keyValueStoreName),
  }
}


function getDataFromClubInformation(associationDetails: any, searchKeySubstring: string): string {
  if (!associationDetails?.clubInformation) {
    return null;
  }

  const suitableItem: Record<string, string> = (associationDetails?.clubInformation ?? [])
    .find(i => {
      const emailKey = Object.keys(i).find(k => k.toLowerCase().includes(searchKeySubstring));

      if (!emailKey) {
        return false;
      }

      return true;
    });

  if (!suitableItem) {
    return null;
  }

  return Object.values(suitableItem)?.[0];
}


function getActivitiesFromClubInformation(associationDetails: any): string {
  return getDataFromClubInformation(associationDetails, 'activities');
}

function getEmailFromClubInformation(associationDetails: any): string {
  return getDataFromClubInformation(associationDetails, 'email');
}


function getOfficialsFromDetails(associationDetails: any,): ClubOfficial[] {
  if (!associationDetails?.clubOfficials) {
    return null;
  }

  return (associationDetails?.clubOfficials ?? []).map(i => {
    const [role, name] = Object.entries(i)?.[0];

    return {role: role.toLowerCase(), name};
  });
}


function getCarAssociationType(keyValueStoreName: string): CarAssociationType {
  const clubsSuffix = '-clubs';
  const dealersSuffix = '-dealers';
  const suppliersSuffix = '-suppliers';

  if (keyValueStoreName.endsWith(clubsSuffix)) {
    return 'club';
  } else if (keyValueStoreName.endsWith(dealersSuffix)) {
    return 'dealer';
  } else if (keyValueStoreName.endsWith(suppliersSuffix)) {
    return 'supplier';
  }
}


function processMultiSourceDataField<T extends unknown = any>(value: T,
                                                              multiSourceValue: MultiSourceData<any>,
                                                              keyValueStoreName: string): MultiSourceData<any> {
  if (!value) {
    return multiSourceValue;
  }

  const dataSource = getDataSourceFromKVSKey(keyValueStoreName);

  let newItemList: MultiSourceData<string>;

  if (Array.isArray(value)) {
    newItemList = value.map((i: string) => ({data: i, source: dataSource}));
  } else if (typeof value === 'string') {
    newItemList = [{data: value, source: dataSource}];
  }

  return [...(multiSourceValue ?? []), ...newItemList];
}


function getDataSourceFromKVSKey(keyValueStoreName: string): DataSource {
  const keys = Object.keys(KVSKeyToDomainMap);

  const suitableKey = keys.find(k => keyValueStoreName.includes(k));

  return KVSKeyToDomainMap[suitableKey];
}
