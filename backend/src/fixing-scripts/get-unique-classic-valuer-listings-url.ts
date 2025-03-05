import {promises as fsPromises} from 'fs';
import {join} from 'path';


const {readFile, writeFile} = fsPromises;


const directoryWithFilesPath = join('src', 'fixing-scripts', '.tmp');


export async function getUniqueClassicValuerListingsForLastYear() {
  const uniqueListingPath = join(directoryWithFilesPath, 'unique-classic-valuer-listing-list.json');

  const listingList: {auction_date_short: string;}[] = await loadJSONFile(uniqueListingPath);

  const lastYearListingList = listingList
    .filter(i => i.auction_date_short.startsWith('2024'));

  console.log(lastYearListingList.length);
}


export async function getUniqueClassicValuerListings() {
  const classicComUrlList = await getClassicComUrlList();
  const classicComUrlListLowercase = classicComUrlList.map(i => i.toLowerCase());

  const classicValuerListingList = await getClassicValuerListingList();

  const classicValuerUrlToListingListMap = new Map();
  classicValuerListingList.forEach(i => classicValuerUrlToListingListMap.set(i.link, i));

  const uniqueClassicValuerListingList = Array.from(classicValuerUrlToListingListMap.values());

  const uniqueUrlList = [];

  for (const classicValuerListing of uniqueClassicValuerListingList) {
    const classicComListingIndex = classicComUrlListLowercase
      .findIndex(url => url === classicValuerListing.link.toLowerCase());
    const listingExistsOnClassicCom = classicComListingIndex !== -1;
    const processedIndex = uniqueClassicValuerListingList.indexOf(classicValuerListing);

    if (processedIndex % 1000 === 0) {
      console.log('checked', processedIndex, uniqueUrlList.length);
    }

    if (!listingExistsOnClassicCom) {
      uniqueUrlList.push(classicValuerListing);
    }
  }

  const resultFilePath = join(directoryWithFilesPath, 'unique-classic-valuer-listing-list.json');

  await writeFile(resultFilePath, JSON.stringify(uniqueUrlList));
}


async function getClassicComUrlList(): Promise<string[]> {
  const fileName = 'classic-com-full-listing-url.json';

  const filePath = join(directoryWithFilesPath, fileName);

  const listingList = await loadJSONFile(filePath);

  return listingList
    .map(i => i?.forSaleLink)
    .filter(i => !!i);
}


async function getClassicValuerListingList(): Promise<{auction_date_short: string; link: string}[]> {
  const fileName = 'theclassicvaluer-com-listing-url.json';

  const filePath = join(directoryWithFilesPath, fileName);

  return await loadJSONFile(filePath);
}


async function loadJSONFile(path: string): Promise<any[]> {
  const fileBuffer = await readFile(path);

  const fileContent = fileBuffer.toString();

  try {
    return JSON.parse(fileContent) as any[];
  } catch (e) {
    return null;
  }
}