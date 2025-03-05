import {promises as fsPromises} from 'fs';
import {join} from 'path';
import {apifyHelperFactory} from '../utils/apify-helper';


const {readFile, writeFile} = fsPromises;
const apifyHelper = apifyHelperFactory();


const topLevelDomainList = [
  ".ac",
  ".ad",
  ".ae",
  ".af",
  ".ag",
  ".ai",
  ".al",
  ".am",
  ".ao",
  ".aq",
  ".ar",
  ".as",
  ".asia",
  ".at",
  ".au",
  ".aw",
  ".ax",
  ".az",
  ".ba",
  ".bb",
  ".bd",
  ".be",
  ".bf",
  ".bg",
  ".bh",
  ".bi",
  ".bj",
  ".bm",
  ".bn",
  ".bo",
  ".br",
  ".bs",
  ".bt",
  ".bw",
  ".by",
  ".bz",
  ".ca",
  ".cc",
  ".cd",
  ".cf",
  ".cg",
  ".ch",
  ".ci",
  ".ck",
  ".cl",
  ".cm",
  ".cn",
  ".co",
  ".co.ao",
  ".co.ba",
  ".co.bw",
  ".co.cc",
  ".co.ck",
  ".co.cr",
  ".co.fk",
  ".co.id",
  ".co.il",
  ".co.im",
  ".co.in",
  ".co.jp",
  ".co.ke",
  ".co.kr",
  ".co.ls",
  ".co.ma",
  ".co.mz",
  ".co.nl",
  ".co.nz",
  ".co.th",
  ".co.tz",
  ".co.ug",
  ".co.uk",
  ".co.uz",
  ".co.ve",
  ".co.vi",
  ".co.za",
  ".co.zm",
  ".co.zw",
  ".com",
  ".com.af",
  ".com.ag",
  ".com.ai",
  ".com.al",
  ".com.ar",
  ".com.au",
  ".com.aw",
  ".com.az",
  ".com.bb",
  ".com.bd",
  ".com.bh",
  ".com.bi",
  ".com.bm",
  ".com.bn",
  ".com.bo",
  ".com.br",
  ".com.bs",
  ".com.bt",
  ".com.by",
  ".com.bz",
  ".com.cm",
  ".com.cn",
  ".com.co",
  ".com.cu",
  ".com.cv",
  ".com.cy",
  ".com.do",
  ".com.dz",
  ".com.ec",
  ".com.ee",
  ".com.eg",
  ".com.es",
  ".com.et",
  ".com.fj",
  ".com.ge",
  ".com.gh",
  ".com.gi",
  ".com.gl",
  ".com.gn",
  ".com.gp",
  ".com.gr",
  ".com.gt",
  ".com.gu",
  ".com.hk",
  ".com.hn",
  ".com.hr",
  ".com.ht",
  ".com.jm",
  ".com.jo",
  ".com.kg",
  ".com.kh",
  ".com.ki",
  ".com.kw",
  ".com.ky",
  ".com.kz",
  ".com.lb",
  ".com.lc",
  ".com.lk",
  ".com.lr",
  ".com.lv",
  ".com.ly",
  ".com.mg",
  ".com.mk",
  ".com.mm",
  ".com.mo",
  ".com.mt",
  ".com.mu",
  ".com.mv",
  ".com.mw",
  ".com.mx",
  ".com.my",
  ".com.na",
  ".com.nf",
  ".com.ng",
  ".com.ni",
  ".com.np",
  ".com.nr",
  ".com.om",
  ".com.pa",
  ".com.pe",
  ".com.pg",
  ".com.ph",
  ".com.pk",
  ".com.pl",
  ".com.pr",
  ".com.ps",
  ".com.pt",
  ".com.py",
  ".com.qa",
  ".com.ro",
  ".com.sa",
  ".com.sb",
  ".com.sc",
  ".com.sg",
  ".com.sl",
  ".com.sn",
  ".com.sv",
  ".com.sy",
  ".com.tj",
  ".com.tn",
  ".com.tr",
  ".com.tt",
  ".com.tw",
  ".com.ua",
  ".com.uy",
  ".com.uz",
  ".com.vc",
  ".com.ve",
  ".com.vi",
  ".com.vn",
  ".com.ye",
  ".cr",
  ".cv",
  ".cx",
  ".cy",
  ".cz",
  ".de",
  ".dj",
  ".dk",
  ".dm",
  ".do",
  ".dz",
  ".ec",
  ".edu",
  ".ee",
  ".eg",
  ".es",
  ".eu",
  ".fi",
  ".fj",
  ".fk",
  ".fm",
  ".fo",
  ".fr",
  ".ga",
  ".gd",
  ".ge",
  ".gf",
  ".gg",
  ".gh",
  ".gi",
  ".gl",
  ".gm",
  ".gn",
  ".gov",
  ".gp",
  ".gq",
  ".gr",
  ".gs",
  ".gt",
  ".gu",
  ".gy",
  ".hk",
  ".hm",
  ".hn",
  ".hr",
  ".ht",
  ".hu",
  ".id",
  ".ie",
  ".il",
  ".im",
  ".in",
  ".io",
  ".iq",
  ".is",
  ".it",
  ".je",
  ".jm",
  ".jo",
  ".jp",
  ".ke",
  ".kg",
  ".kh",
  ".ki",
  ".km",
  ".kn",
  ".kr",
  ".kw",
  ".ky",
  ".kz",
  ".la",
  ".lb",
  ".lc",
  ".li",
  ".lk",
  ".lr",
  ".ls",
  ".lt",
  ".lu",
  ".lv",
  ".ly",
  ".ma",
  ".mc",
  ".md",
  ".me",
  ".mg",
  ".mil",
  ".mk",
  ".ml",
  ".mm",
  ".mn",
  ".mo",
  ".mobi",
  ".mp",
  ".mq",
  ".mr",
  ".ms",
  ".mt",
  ".mu",
  ".mv",
  ".mw",
  ".mx",
  ".my",
  ".na",
  ".name",
  ".nc",
  ".ne",
  ".ne.jp",
  ".net",
  ".net.ck",
  ".net.cm",
  ".net.in",
  ".nf",
  ".ng",
  ".ni",
  ".nl",
  ".no",
  ".np",
  ".nr",
  ".nu",
  ".nz",
  ".og.ao",
  ".om",
  ".or.th",
  ".org",
  ".org.ck",
  ".org.cn",
  ".org.ls",
  ".pa",
  ".pe",
  ".pf",
  ".pg",
  ".ph",
  ".pk",
  ".pl",
  ".pm",
  ".pn",
  ".pr",
  ".pro",
  ".ps",
  ".pt",
  ".py",
  ".qa",
  ".re",
  ".ro",
  ".rs",
  ".ru",
  ".rw",
  ".sa",
  ".sb",
  ".sc",
  ".se",
  ".sg",
  ".sh",
  ".si",
  ".sk",
  ".sl",
  ".sm",
  ".sn",
  ".so",
  ".sr",
  ".st",
  ".su",
  ".sv",
  ".sy",
  ".tc",
  ".td",
  ".tf",
  ".tg",
  ".th",
  ".tj",
  ".tk",
  ".tl",
  ".tm",
  ".tn",
  ".to",
  ".tr",
  ".tt",
  ".tv",
  ".tw",
  ".tz",
  ".ua",
  ".ug",
  ".uk",
  ".us",
  ".uy",
  ".uz",
  ".vc",
  ".ve",
  ".vg",
  ".vi",
  ".vn",
  ".vu",
  ".wf",
  ".ws",
  ".xxx",
  ".ye",
  ".yt",
  ".za",
  ".zm",
  ".zw",
]


const listingFileListFolder = join('src', 'fixing-scripts', '.tmp');


export async function groupListingUrlListByDomainForAggregativeSites(): Promise<void> {
  const classicComGroupedListingUrl = await groupListingUrlListByDomainForClassicCom();
  const classicValuerGroupedListingUrl = await groupListingUrlListByDomainForClassicValuerCom();

  const classicComDomainWithListingUrlCount = collectListingCountByDomain2(classicComGroupedListingUrl);
  const classicValuerDomainWithListingUrlCount = collectListingCountByDomain2(classicValuerGroupedListingUrl);

  console.log();
}


export async function collectDomainListForAggregativeSites(): Promise<void> {

  const classicComDomainList = await getClassicComDomainList();
  const classicValuerDomainList = await getClassicValuerDomainList();

  const domainList = classicComDomainList;

  classicValuerDomainList.forEach(u => domainList.includes(u) ? null : domainList.push(u));

  const kvsRecordList = await apifyHelper.loadRecordsFromApifyKVS<{website: string}>({
    keyValueStoreName: 'cars-websites-data',
    keyFilter: keyName => keyName === 'car-associations'
  });

  const carAssociationsWebsiteList = kvsRecordList[0].value.map(i => i.website);

  const fullDomainList = [
    ...classicValuerDomainList,
    ...classicValuerDomainList,
    ...carAssociationsWebsiteList
  ];

  const sortedFullDomainList = fullDomainList
    .map(i => i.replace('httphttps', 'https'))
    .sort((a, b) => {
    const protoA = a.split(':')[0];
    const protoB = b.split(':')[0];

    return protoB.length - protoA.length;
  });


  const urlList = sortedFullDomainList
    .map(i => {
      try {
        return new URL(i);
      } catch (e) {
        return null;
      }
    })
    .filter(i => !!i);

  const uniqueUrlList: URL[] = [];

  urlList.forEach(url => {
    const existingURL = uniqueUrlList.find(u => isURLsEqual(url, u));

    if (existingURL) {
      return;
    }

    uniqueUrlList.push(clearURL(url));
  });

  const uniqueDomainList = uniqueUrlList.map(url => `${url.protocol}//${url.hostname}`);

  await apifyHelper.storeDataInKVS('cars-websites-data', 'org-url-list', uniqueDomainList);

}


function isURLsEqual(url1: URL, url2: URL): boolean {
  const clearedURL1 = clearURL(url1);
  const clearedURL2 = clearURL(url2);

  return clearedURL1.hostname === clearedURL2.hostname;
}


function clearURL(url: URL): URL {
  return new URL(`${url.protocol}//${url.hostname.replace('www.', '')}`);
}


function collectListingCountByDomain2(groupedListingUrl: Record<string, string[]>): {domain: string; listingCount: number}[] {
  return Object.entries(groupedListingUrl)
    .map(([domain, listingUrlList]) => ({domain, listingCount: listingUrlList.length}))
    .sort((a, b) => b.listingCount - a.listingCount);
}

function collectListingCountByDomain(groupedListingUrl: Record<string, string[]>): Record<string, number> {
  return Object.entries(groupedListingUrl)
    .reduce((result: Record<string, number>, [domain, urlList]) => {
      result[domain] = urlList.length;

      return result;
    }, {});
}


async function groupListingUrlListByDomainForClassicCom(): Promise<Record<string, string[]>> {
  const filePath = join(listingFileListFolder, 'classic-com-full-listing-url.json');
  const listingUrlGetter = l => l?.forSaleLink;

  return groupListingUrlListByDomain(filePath, listingUrlGetter);
}


async function groupListingUrlListByDomainForClassicValuerCom(): Promise<Record<string, string[]>> {
  const filePath = join(listingFileListFolder, 'theclassicvaluer-com-listing-url.json');
  const listingUrlGetter = l => l?.link;

  return groupListingUrlListByDomain(filePath, listingUrlGetter);
}


async function getClassicValuerDomainList(): Promise<string[]> {
  const filePath = join(listingFileListFolder, 'theclassicvaluer-com-listing-url.json');
  const listingUrlGetter = l => l?.link;

  const domainList = await getDomainListFromListingList(filePath, listingUrlGetter);

  return domainList;
}


async function getClassicComDomainList(): Promise<string[]> {
  const filePath = join(listingFileListFolder, 'classic-com-full-listing-url.json');
  const listingUrlGetter = l => l?.forSaleLink;

  const domainList = await getDomainListFromListingList(filePath, listingUrlGetter);

  return domainList;
}


async function groupListingUrlListByDomain(listingFilePath: string,
                                           listingUrlGetter: (listing) => string): Promise<Record<string, string[]>> {
  const listingList = await loadJSONFile(listingFilePath);

  const domainMap = {};

  for (const listing of listingList) {
    const sourceUrlStr = listingUrlGetter(listing);

    if (!sourceUrlStr) {
      continue;
    }

    const domain = getWebsiteDomain(sourceUrlStr);

    if (!domain) {
      continue;
    }

    const urlList = domainMap[domain] ?? [];

    urlList.push(sourceUrlStr);

    domainMap[domain] = urlList;
  }

  return domainMap;
}


async function getDomainListFromListingList(listingFilePath: string,
                                            listingUrlGetter: (listing) => string): Promise<string[]> {
  const listingList = await loadJSONFile(listingFilePath);

  const domainList = [];

  for (const listing of listingList) {
    const sourceUrlStr = listingUrlGetter(listing);

    if (!sourceUrlStr) {
      continue;
    }

    const domain = getWebsiteDomain(sourceUrlStr);

    if (!domain) {
      continue;
    }

    if (domainList.includes(domain)) {
      continue;
    }

    domainList.push(domain);
  }

  return domainList;
}


function getWebsiteDomain(urlStr: string): string {
  let url: URL;

  try {
    url = new URL(urlStr);
  } catch (e) {
    return null;
  }

  const hostname = url.hostname.replace('www.', '');

  const topLevelDomain = topLevelDomainList.find(i => hostname.endsWith(i));

  const hostnameWithoutTopLevelDomain = hostname.replace(topLevelDomain, '');

  const domainParts = hostnameWithoutTopLevelDomain.split('.');

  const domainName = domainParts[domainParts.length - 1];

  return `${url.protocol}//${domainName}${topLevelDomain}`;
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
