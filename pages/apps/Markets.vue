<script setup>
import { ref } from 'vue';

const sortOrder = ref(-1);
const sortOptions = [
    { label: 'Year', value: 'year' },
    { label: 'Name', value: 'name' },
    { label: 'Nickname', value: 'nickname' }
];

const market = ref({
    _id: '669a4824b66b93c06179784c',
    _doc: '669a4824b66b93c06179784a',
    name: 'Austin-Healey 100M',
    years: ['1955', '1956'],
    classicUrl: 'https://www.classic.com/m/austin-healey/100/bn2/100m',
    classicDescription:
        'The Austin-Healey 100M was a series of performance cars introduced in 1955 for the 1956 model year. The 100M was a high performance variant of the Austin-Healey 100 BN2, and it featured a range of performance improvements to the engine such as higher compression, a cold-air box, and larger carburetors, other components such as the suspension also saw improvement. While many of the components fitted to the 100M were available as an optional "Le Mans" performance kit, only 640 examples were built at the factory. Production of the Austin-Healey 100M took place until 1956.',
    path: [
        {
            slug: 'austin-healey',
            name: 'Austin-Healey',
            id: '669a4819b66b93c061797808'
        },
        {
            slug: '100',
            name: '100',
            id: '669a481ab66b93c06179780b'
        },
        {
            slug: 'bn2',
            name: 'BN2',
            id: '669a4820b66b93c06179782f'
        },
        {
            slug: '100m',
            name: '100M',
            id: '669a4824b66b93c06179784a'
        }
    ],
    metadata: {
        slugToken: 'austin-healey@100@bn2@100m',
        parentMarketId: '669a4820b66b93c06179782f',
        parentSlugPathReverse: ['bn2', '100', 'austin-healey'],
        parentSlugPath: ['austin-healey', '100', 'bn2']
    },
    _type: 'markets',
    title: 'Austin-Healey 100M',
    lastUpdated: {
        userType: 'auto',
        isSwp: false,
        date: '2024-07-19T15:04:04+04:00',
        isTest: false,
        environment: 'development'
    },
    _hash: -2042753269
});

const markets = ref([
    {
        _id: '669a481cb66b93c061797819',
        _doc: '669a481cb66b93c061797817',
        name: 'Austin-Healey 100-6 - BN4',
        years: ['1956', '1957', '1958', '1959'],
        classicUrl: 'https://www.classic.com/m/austin-healey/100-6/bn4',
        classicDescription:
            "The Austin-Healey 100-6 was introduced in 1956 for the 1957 model year. The 100-6 was the successor to the Austin-Healey 100, and featured the '6' in its name due to its 2.7L inline six engine. The first variant introduced the BN4. The BN4 was the designation for the 2+2 roadster body style, which ran the whole life of the model. A two seat version of the 100-6 known as the BN6 was available for the 1959 model year. Production of the Austin-Healey 100-6 ended in 1959, and the model was replaced by the Austin-Healey 3000.",
        path: [
            {
                slug: 'austin-healey',
                name: 'Austin-Healey',
                id: '669a4819b66b93c061797808'
            },
            {
                slug: '100-6',
                name: '100-6',
                id: '669a481ab66b93c06179780e'
            },
            {
                slug: 'bn4',
                name: 'BN4',
                id: '669a481cb66b93c061797817'
            }
        ],
        metadata: {
            slugToken: 'austin-healey@100-6@bn4',
            parentMarketId: '669a481ab66b93c06179780e',
            parentSlugPathReverse: ['100-6', 'austin-healey'],
            parentSlugPath: ['austin-healey', '100-6']
        },
        _type: 'markets',
        title: 'Austin-Healey 100-6 - BN4',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-19T15:03:56+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: 744742841
    },
    {
        _id: '669a481db66b93c06179781f',
        _doc: '669a481db66b93c06179781d',
        name: 'Austin-Healey Sprite - Mk I',
        years: ['1958', '1959', '1960', '1961'],
        classicUrl: 'https://www.classic.com/m/austin-healey/sprite/mk-i',
        classicDescription:
            'The first generation of Austin-Healey Sprite, known as the Mk I, was introduced in 1958 for the 1959 model year. The Mk I Sprite was designed by Donald Healey and featured a distinictive design that lead to the model being affectionately known as the Bugeye or Frogeye. This generation of Sprite was powered by a 948cc inline four engine that generated 43hp. The lightweight Mk I Sprite proved very popular among motorsport fans, with the car actively participating in rallying and track based series to this day. Production of the first generation Sprite lasted until 1961, when the Austin-Healey Mk II Sprite was unveiled.',
        path: [
            {
                slug: 'austin-healey',
                name: 'Austin-Healey',
                id: '669a4819b66b93c061797808'
            },
            {
                slug: 'sprite',
                name: 'Sprite',
                id: '669a481bb66b93c061797811'
            },
            {
                slug: 'mk-i',
                name: 'Mk I',
                id: '669a481db66b93c06179781d'
            }
        ],
        metadata: {
            slugToken: 'austin-healey@sprite@mk-i',
            parentMarketId: '669a481bb66b93c061797811',
            parentSlugPathReverse: ['sprite', 'austin-healey'],
            parentSlugPath: ['austin-healey', 'sprite']
        },
        _type: 'markets',
        title: 'Austin-Healey Sprite - Mk I',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-19T15:03:57+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: -1650914091
    },
    {
        _id: '669a481eb66b93c061797828',
        _doc: '669a481eb66b93c061797826',
        name: 'Austin-Healey Sprite - Mk II',
        years: ['1961', '1962', '1963', '1964'],
        classicUrl: 'https://www.classic.com/m/austin-healey/sprite/mk-ii',
        classicDescription:
            'The second generation of Austin-Healey Sprite, known as the Mk II, was introduced in 1961 for the 1962 model year. The Mk II Sprite saw a drastic design change from the previous generation, no longer sporting the well known Bugeye look. Initially, the Mk II was offered with a slightly more powerful version of the 948cc inline four featured in the Mk I, but in late 1962, a larger 56hp 1.1L inline four engine replaced the previous unit. In 1961, MG introduced a higher end, badge engineered version of the Sprite known as the MG Midget. Production of the Mk II Sprite ended in 1964 with the introduction of the Austin-Healey Mk III Sprite.',
        path: [
            {
                slug: 'austin-healey',
                name: 'Austin-Healey',
                id: '669a4819b66b93c061797808'
            },
            {
                slug: 'sprite',
                name: 'Sprite',
                id: '669a481bb66b93c061797811'
            },
            {
                slug: 'mk-ii',
                name: 'Mk II',
                id: '669a481eb66b93c061797826'
            }
        ],
        metadata: {
            slugToken: 'austin-healey@sprite@mk-ii',
            parentMarketId: '669a481bb66b93c061797811',
            parentSlugPathReverse: ['sprite', 'austin-healey'],
            parentSlugPath: ['austin-healey', 'sprite']
        },
        _type: 'markets',
        title: 'Austin-Healey Sprite - Mk II',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-19T15:03:58+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: 1936051888
    },
    {
        _id: '669a4820b66b93c061797831',
        _doc: '669a4820b66b93c06179782f',
        name: 'Austin-Healey 100 - BN2',
        years: ['1955', '1956'],
        classicUrl: 'https://www.classic.com/m/austin-healey/100/bn2',
        classicDescription:
            'The second generation of Austin-Healey 100 was introduced in 1955 for the 1956 model year. The second generation of 100 was known as the BN2, and featured the notable addition of a four-speed manual transmission. The same 2.7L inline four engine from the previous BN1 was used, but subtle changes such as larger front wheel arches and a new rear axle helped to separate the evolutions. The most notable BN2 variant was the high performance 100M. Production of the Austin-Healey 100 ended in 1956.',
        path: [
            {
                slug: 'austin-healey',
                name: 'Austin-Healey',
                id: '669a4819b66b93c061797808'
            },
            {
                slug: '100',
                name: '100',
                id: '669a481ab66b93c06179780b'
            },
            {
                slug: 'bn2',
                name: 'BN2',
                id: '669a4820b66b93c06179782f'
            }
        ],
        metadata: {
            slugToken: 'austin-healey@100@bn2',
            parentMarketId: '669a481ab66b93c06179780b',
            parentSlugPathReverse: ['100', 'austin-healey'],
            parentSlugPath: ['austin-healey', '100']
        },
        _type: 'markets',
        title: 'Austin-Healey 100 - BN2',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-19T15:04:00+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: 1825971222
    },
    {
        _id: '669a481bb66b93c061797810',
        _doc: '669a481ab66b93c06179780e',
        name: 'Austin-Healey 100-6',
        years: ['1956', '1957', '1958', '1959'],
        classicUrl: 'https://www.classic.com/m/austin-healey/100-6',
        classicDescription:
            "The Austin-Healey 100-6 was a series of roadsters introduced for the 1957 model year. The 100-6 was the second model released by Austin-Healey and featured the '6' in its name due to its 2.7L inline six engine. In terms of design, the 100-6 was clearly following the standard set by its predecessor, but with sleeker lines and a smaller front grill. Two body styles were offered for the 100-6, the BN4 2+2 (1957-1959), and BN6 Two Seat (1959). The larger engine of the 100-6 made it a popular choice to be used as a Race Car.",
        path: [
            {
                slug: 'austin-healey',
                name: 'Austin-Healey',
                id: '669a4819b66b93c061797808'
            },
            {
                slug: '100-6',
                name: '100-6',
                id: '669a481ab66b93c06179780e'
            }
        ],
        metadata: {
            slugToken: 'austin-healey@100-6',
            parentMarketId: '669a4819b66b93c061797808',
            parentSlugPathReverse: ['austin-healey'],
            parentSlugPath: ['austin-healey']
        },
        _type: 'markets',
        title: 'Austin-Healey 100-6',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-19T15:03:55+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: 1480122876
    },
    {
        _id: '669a4823b66b93c061797846',
        _doc: '669a4823b66b93c061797844',
        name: 'Austin-Healey 100S',
        years: ['1953'],
        classicUrl: 'https://www.classic.com/m/austin-healey/100/bn1/100s',
        classicDescription:
            "The Austin-Healey 100S was a series of limited production, aluminium-bodied cars introduced in 1955. The 100S derived from the BN1 100, and was developed for racing, with the 'S' in the name referring to the famous Sebring racetrack. These special cars saw improvements to the drivetrain and engine, and were built in limited numbers, with only 50 production cars sold. An additional five examples were built as prototypes and development cars. Production of the Austin-Healey 100S ended before the end of 1955.",
        path: [
            {
                slug: 'austin-healey',
                name: 'Austin-Healey',
                id: '669a4819b66b93c061797808'
            },
            {
                slug: '100',
                name: '100',
                id: '669a481ab66b93c06179780b'
            },
            {
                slug: 'bn1',
                name: 'BN1',
                id: '669a481db66b93c061797820'
            },
            {
                slug: '100s',
                name: '100S',
                id: '669a4823b66b93c061797844'
            }
        ],
        metadata: {
            slugToken: 'austin-healey@100@bn1@100s',
            parentMarketId: '669a481db66b93c061797820',
            parentSlugPathReverse: ['bn1', '100', 'austin-healey'],
            parentSlugPath: ['austin-healey', '100', 'bn1']
        },
        _type: 'markets',
        title: 'Austin-Healey 100S',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-19T15:04:03+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: -1775030092
    },
    {
        _id: '669a4824b66b93c06179784c',
        _doc: '669a4824b66b93c06179784a',
        name: 'Austin-Healey 100M',
        years: ['1955', '1956'],
        classicUrl: 'https://www.classic.com/m/austin-healey/100/bn2/100m',
        classicDescription:
            'The Austin-Healey 100M was a series of performance cars introduced in 1955 for the 1956 model year. The 100M was a high performance variant of the Austin-Healey 100 BN2, and it featured a range of performance improvements to the engine such as higher compression, a cold-air box, and larger carburetors, other components such as the suspension also saw improvement. While many of the components fitted to the 100M were available as an optional "Le Mans" performance kit, only 640 examples were built at the factory. Production of the Austin-Healey 100M took place until 1956.',
        path: [
            {
                slug: 'austin-healey',
                name: 'Austin-Healey',
                id: '669a4819b66b93c061797808'
            },
            {
                slug: '100',
                name: '100',
                id: '669a481ab66b93c06179780b'
            },
            {
                slug: 'bn2',
                name: 'BN2',
                id: '669a4820b66b93c06179782f'
            },
            {
                slug: '100m',
                name: '100M',
                id: '669a4824b66b93c06179784a'
            }
        ],
        metadata: {
            slugToken: 'austin-healey@100@bn2@100m',
            parentMarketId: '669a4820b66b93c06179782f',
            parentSlugPathReverse: ['bn2', '100', 'austin-healey'],
            parentSlugPath: ['austin-healey', '100', 'bn2']
        },
        _type: 'markets',
        title: 'Austin-Healey 100M',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-19T15:04:04+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: -2042753269
    }
]);

const listings = ref([
    {
        _id: '66aa30548c33c087a26ecaa0',
        content: {
            name: '1960 Austin-Healey 3000 MK I',
            imageURLs: ['https://images.classic.com/vehicles/4be7889f07239079a989a179ae8960073b022efe.jpg?w=1200&h=676&fit=crop'],
            description: null,
            videoURLs: []
        },
        spec: {
            odometer: 690,
            odometerUnit: 'km',
            altOdometer: 429,
            altOdometerUnit: 'mi',
            odometerTMU: true,
            make: 'Austin-Healey',
            model: '3000',
            generation: 'Mk I',
            variant: 'BT7',
            engine: '2.9L I6',
            year: 1960,
            vin: '-',
            engineNumber: null,
            registrationNumber: null,
            transmission: 'Manual',
            stearingSide: 'Left',
            exterior: 'Yellow',
            interior: 'Black',
            bodyStyle: 'Convertible',
            doors: '2 Doors'
        },
        sale: {
            saleType: 'Auction',
            sellerType: 'Dealer',
            dealer: {
                name: 'Catawiki',
                website: 'https://www.catawiki.com'
            },
            saleStatus: 'For Sale',
            currency: null,
            price: null,
            priceType: null,
            auctionEnd: '2024-08-04',
            listingCreated: null,
            country: 'Netherlands',
            address: null,
            listingSource: 'https://www.catawiki.com/en/l/86702743-austin-healey-3000-mk1-bt7-1960',
            listingDomain: 'https://www.catawiki.com'
        },
        dataSource: {
            url: 'https://www.classic.com/veh/1960-austin-healey-3000-mk-i-nXgle14/',
            domain: 'https://www.classic.com',
            fetchTime: '2024-07-29T12:31:51Z',
            html: null
        },
        metadata: {
            slug: '1960-austin-healey-3000-mk-i-nXgle14',
            marketSlugToken: 'austin-healey@3000@mk-i@bt7-mk-i',
            marketSlugPath: ['austin-healey', '3000', 'mk-i', 'bt7-mk-i'],
            marketSlugPathReverse: ['bt7-mk-i', 'mk-i', '3000', 'austin-healey'],
            marketId: '669a4825b66b93c061797850',
            modificationHistory: ['2024-07-26']
        },
        _doc: '66aa30548c33c087a26eca9e',
        created: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-31T16:38:44+04:00',
            isTest: false,
            environment: 'development'
        },
        _type: 'listings',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-31T16:38:44+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: -1162961929
    },
    {
        _id: '66aa313d8c33c087a26ed0e5',
        content: {
            name: '1960 Austin-Healey Bugeye Sprite',
            imageURLs: ['https://images.classic.com/vehicles/da5ecc95a0fb31523ada0a9a1de1be7ed1ae2c97.jpg?w=1200&h=676&fit=crop'],
            description: null,
            videoURLs: []
        },
        spec: {
            odometerTMU: true,
            make: 'Austin-Healey',
            model: 'Sprite',
            generation: 'Mark I',
            variant: '-',
            engine: 'Swap',
            year: 1960,
            vin: '-',
            engineNumber: null,
            registrationNumber: null,
            transmission: 'Manual',
            stearingSide: 'Left',
            exterior: 'White',
            interior: 'Gray',
            bodyStyle: 'Convertible',
            doors: '2 Doors'
        },
        sale: {
            saleType: 'Auction',
            sellerType: 'Dealer',
            dealer: {
                name: 'Hemmings',
                website: 'https://www.hemmings.com'
            },
            saleStatus: 'For Sale',
            currency: null,
            price: null,
            priceType: null,
            auctionEnd: '2024-08-02',
            listingCreated: null,
            country: 'United States',
            address: 'Asheville, North Carolina',
            listingSource: 'https://www.hemmings.com/auction/1960-austin-healey-bugeye-asheville-nc-760805',
            listingDomain: 'https://www.hemmings.com'
        },
        dataSource: {
            url: 'https://www.classic.com/veh/1960-austin-healey-bugeye-sprite-pJNEBkp/',
            domain: 'https://www.classic.com',
            fetchTime: '2024-07-29T12:28:24Z',
            html: null
        },
        metadata: {
            slug: '1960-austin-healey-bugeye-sprite-pJNEBkp',
            marketSlugToken: 'austin-healey@sprite@race-cars',
            marketSlugPath: ['austin-healey', 'sprite', 'race-cars'],
            marketSlugPathReverse: ['race-cars', 'sprite', 'austin-healey'],
            marketId: '669a481fb66b93c06179782c',
            modificationHistory: ['2024-07-28']
        },
        _doc: '66aa313d8c33c087a26ed0e3',
        created: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-31T16:42:37+04:00',
            isTest: false,
            environment: 'development'
        },
        _type: 'listings',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-07-31T16:42:37+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: 1321647394
    },
    {
        _id: '66abc9ae7041acb7204a6d22',
        content: {
            name: '1965 Austin-Healey 3000 Mark III BJ8 Convertible',
            imageURLs: ['https://images.classic.com/vehicles/9917f50508a2a54db259f0a56574f639e7af768b.jpg?w=1200&h=676&fit=crop'],
            description: null,
            videoURLs: []
        },
        spec: {
            odometerTMU: true,
            make: 'Austin-Healey',
            model: '3000',
            generation: 'Mk III',
            variant: 'BJ8',
            engine: '2.9L I6',
            year: 1965,
            vin: 'HBJ8L25720',
            engineNumber: null,
            registrationNumber: null,
            transmission: '-',
            stearingSide: null,
            exterior: '-',
            interior: '-',
            bodyStyle: '-',
            doors: '-'
        },
        sale: {
            saleType: 'Classified',
            sellerType: 'Dealer',
            dealer: {
                name: 'Barrett-Jackson',
                website: 'https://www.barrett-jackson.com'
            },
            saleStatus: 'Sold',
            currency: 'BMD',
            price: 45100,
            priceType: 'Sold',
            auctionEnd: null,
            listingCreated: null,
            country: 'United States',
            address: 'Scottsdale, AZ',
            listingSource: 'https://www.barrett-jackson.com/Events/Event/Details/1965-AUSTIN-HEALEY-3000-MARK-III-BJ8-CONVERTIBLE-213487',
            listingDomain: 'https://www.barrett-jackson.com'
        },
        dataSource: {
            url: 'https://www.classic.com/veh/1965-austin-healey-3000-mark-iii-bj8-convertible-h-v4oXGan/',
            domain: 'https://www.classic.com',
            html: null
        },
        metadata: {
            slug: '1965-austin-healey-3000-mark-iii-bj8-convertible-hbj8l25720-v4oXGan',
            marketSlugToken: 'austin-healey@3000@bj8',
            marketSlugPath: ['austin-healey', '3000', 'bj8'],
            marketSlugPathReverse: ['bj8', '3000', 'austin-healey'],
            marketId: '669a4821b66b93c061797838',
            modificationHistory: []
        },
        _doc: '66abc9ae7041acb7204a6d20',
        created: {
            userType: 'auto',
            isSwp: false,
            date: '2024-08-01T21:45:18+04:00',
            isTest: false,
            environment: 'development'
        },
        _type: 'listings',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-08-01T21:45:18+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: -897852706
    },
    {
        _id: '66abcb4bb89674a5a26f28c8',
        content: {
            name: '1964 Austin-Healey Sprite MK II',
            imageURLs: ['https://images.classic.com/vehicles/c59a7ae4251c4088cf0971ce7f7aa41d188f5875.jpg?w=1200&h=676&fit=crop'],
            description: null,
            videoURLs: []
        },
        spec: {
            odometerTMU: true,
            make: 'Austin-Healey',
            model: 'Sprite',
            generation: 'Mark II',
            variant: '-',
            engine: '1.1L I4 (A-Series)',
            year: 1964,
            vin: 'HAN7L38006',
            engineNumber: null,
            registrationNumber: null,
            transmission: 'Manual',
            stearingSide: null,
            exterior: 'Blue',
            interior: 'Blue',
            bodyStyle: 'Convertible',
            doors: '2 Doors'
        },
        sale: {
            saleType: 'Classified',
            sellerType: 'Dealer',
            dealer: {
                name: 'Bring a Trailer',
                website: 'https://bringatrailer.com'
            },
            saleStatus: 'Sold',
            currency: 'BMD',
            price: 8100,
            priceType: 'Sold',
            auctionEnd: null,
            listingCreated: null,
            country: 'United States',
            address: 'Topeka, KS',
            listingSource: 'https://bringatrailer.com/listing/1964-austin-healey-sprite-mk-ii/',
            listingDomain: 'https://bringatrailer.com'
        },
        dataSource: {
            url: 'https://www.classic.com/veh/1964-austin-healey-sprite-mk-ii-han7l38006-V4Mzkxn/',
            domain: 'https://www.classic.com',
            html: null
        },
        metadata: {
            slug: '1964-austin-healey-sprite-mk-ii-han7l38006-V4Mzkxn',
            marketSlugToken: 'austin-healey@sprite@mk-ii',
            marketSlugPath: ['austin-healey', 'sprite', 'mk-ii'],
            marketSlugPathReverse: ['mk-ii', 'sprite', 'austin-healey'],
            marketId: '669a481eb66b93c061797826',
            modificationHistory: []
        },
        _doc: '66abcb4bb89674a5a26f28c6',
        created: {
            userType: 'auto',
            isSwp: false,
            date: '2024-08-01T21:52:11+04:00',
            isTest: false,
            environment: 'development'
        },
        _type: 'listings',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-08-01T21:52:11+04:00',
            isTest: false,
            environment: 'development'
        },
        _hash: 171559390
    },
    {
        _id: '66aca51be5767fd572ffe50c',
        content: {
            name: '1956 Austin-Healey 100 M',
            imageURLs: ['https://images.classic.com/vehicles/1009cf22011c690f8261aa70c0e61afdc67e4c6a.jpg?w=1200&h=676&fit=crop'],
            description: null,
            videoURLs: []
        },
        spec: {
            odometerTMU: true,
            make: 'Austin-Healey',
            model: '100',
            generation: 'BN2',
            variant: '100M',
            engine: '2.7L I4',
            year: 1956,
            vin: 'BN2-L/232183',
            engineNumber: null,
            registrationNumber: null,
            transmission: 'Manual',
            stearingSide: 'Left',
            exterior: 'Black',
            interior: 'Red/Burgundy',
            bodyStyle: 'Convertible',
            doors: '2 Doors'
        },
        sale: {
            saleType: 'Classified',
            sellerType: 'Dealer',
            dealer: {
                name: 'Gooding & Company',
                website: 'https://www.goodingco.com'
            },
            saleStatus: 'Sold',
            currency: 'BMD',
            price: 137500,
            priceType: 'Sold',
            auctionEnd: null,
            listingCreated: null,
            country: 'United States',
            address: 'Scottsdale, AZ',
            listingSource: 'https://www.goodingco.com/vehicle/1956-austin-healey-100-m-2/',
            listingDomain: 'https://www.goodingco.com'
        },
        dataSource: {
            url: 'https://www.classic.com/veh/1956-austin-healey-100-m-bn2l232183-v4ooeJ4/',
            domain: 'https://www.classic.com',
            html: null
        },
        metadata: {
            slug: '1956-austin-healey-100-m-bn2l232183-v4ooeJ4',
            marketSlugToken: 'austin-healey@100@bn2@100m',
            marketSlugPath: ['austin-healey', '100', 'bn2', '100m'],
            marketSlugPathReverse: ['100m', 'bn2', '100', 'austin-healey'],
            marketId: '669a4824b66b93c06179784a',
            modificationHistory: []
        },
        _doc: '66aca51be5767fd572ffe50a',
        created: {
            userType: 'auto',
            isSwp: false,
            date: '2024-08-02T09:21:31Z',
            isTest: false,
            environment: 'development'
        },
        _type: 'listings',
        lastUpdated: {
            userType: 'auto',
            isSwp: false,
            date: '2024-08-02T09:21:31Z',
            isTest: false,
            environment: 'development'
        },
        _hash: 1139702882
    }
]);

const sortField = ref(null);
const sortKey = ref(null);

const onSortChange = (event) => {
    const value = event.value.value;
    const sortValue = event.value;

    if (value.indexOf('!') === 0) {
        sortOrder.value = 1;
        sortField.value = value.substring(1, value.length);
        sortKey.value = sortValue;
    } else {
        sortOrder.value = -1;
        sortField.value = value;
        sortKey.value = sortValue;
    }
};
</script>

<template>
    <div class="card">
        <h1>{{ market.name }}</h1>
        <div>{{ market.classicDescription }}</div>
    </div>
    <div class="card">
        <DataView :value="markets" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Sub Markets</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="slotProps">
                <layout-grid>
                    <ModelCard v-for="(item, index) in slotProps.items" :key="index" :name="item.name" :make="item.make" :years="item.years" :images="item.images" />
                </layout-grid>
            </template>
        </DataView>
        <DataView :value="listings" paginator :rows="7" layout="grid" :sortOrder="sortOrder" :sortField="sortField">
            <template #header>
                <div class="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3">
                    <span class="text-xl text-900 font-semibold">Listings</span>
                    <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Sort By" class="w-full md:w-15rem" @change="onSortChange($event)" />
                </div>
            </template>
            <template #grid="slotProps">
                <layout-grid>
                    <ListingCard
                        v-for="(item, index) in slotProps.items"
                        :key="index"
                        :name="item.content.name"
                        :make="item.spec.make"
                        :images="item.content.imageURLs"
                        :saleType="item.sale.saleType"
                        :price="item.sale.price"
                        :engine="item.spec.engine"
                        :odometer="item.spec.odometer"
                        :transmission="item.spec.transmission"
                        :stearingSide="item.spec.stearingSide"
                    />
                </layout-grid>
            </template>
        </DataView>
    </div>
</template>
