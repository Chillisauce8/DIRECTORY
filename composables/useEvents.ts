export default function useEvents() {
    return [
        {
            id: 'G7hB2k',
            name: 'Engine Rebuild Quote',
            description: 'Complete teardown and inspection required. Original matching numbers engine showing signs of wear. Specialist parts needed from UK supplier.',
            vehicles: [
                {
                    id: 'KMLPQRST',
                    name: 'Jaguar E-Type Series 1 3.8'
                }
            ],
            status: [
                {
                    state: 'Pending',
                    user: {
                        id: 'USR_001',
                        name: 'John Smith'
                    },
                    dateTime: '2024-01-14T15:30:00Z'
                }
            ],
            files: [
                {
                    id: '65465c85c943fd0f932d0017',
                    alt: 'Jaguar E-Type Series 1',
                    type: 'Document'
                }
            ],
            start: '2024-01-15T09:30:00Z',
            end: '2024-01-15T14:30:00Z',
            duration: {
                value: 5,
                unit: 'hrs'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 15,
                        unit: 'mins'
                    },
                    dateTime: '2024-01-15T09:15:00Z'
                }
            ],
            created: '2022-07-12T07:31:46',
            categories: [
                {
                    name: '1956 Austin-Healey 100 BN2',
                    id: 1
                },
                {
                    name: 'Maintainance',
                    id: 8
                },
                {
                    name: 'Ferrari 250 GTO Berlietta',
                    id: 2
                },
                {
                    name: 'Paris to Peking',
                    id: 7
                }
            ]
        },
        {
            id: 'W1xA9c',
            name: 'Carburettor Service',
            vehicles: [
                {
                    id: 'WXYZABCD',
                    name: 'Chevrolet Corvette Stingray'
                },
                {
                    id: 'EFGHIJKL',
                    name: 'Triumph TR6'
                }
            ],
            status: [
                {
                    state: 'Done',
                    user: {
                        id: 'USR_002',
                        name: 'Mike Johnson'
                    },
                    dateTime: '2024-01-15T16:45:00Z'
                },
                {
                    state: 'Deleted',
                    user: {
                        id: 'USR_003',
                        name: 'Sarah Wilson'
                    },
                    dateTime: '2024-01-16T09:20:00Z'
                }
            ],
            files: [
                {
                    id: '654663d2c302c20f899089c3',
                    alt: 'Chevrolet Corvette C2',
                    type: 'Image'
                }
            ],
            start: '2024-02-01T14:15:00Z',
            end: '2024-02-01T16:45:00Z',
            duration: {
                value: 150,
                unit: 'mins'
            },
            alerts: [],
            created: '2023-07-05T23:35:36',
            categories: [
                {
                    name: 'Garage',
                    id: 10
                }
            ]
        },
        {
            id: 'mL2Qw7',
            name: 'Paint Touch-up',
            description: 'Minor stone chips on front wings and bonnet. Color match needed for original Ferrari Rosso Corsa paint.',
            vehicles: [],
            status: [],
            files: [
                {
                    id: '654663afc302c20f899089ba',
                    alt: 'Ferrari 250 GT Berlinetta',
                    type: 'Image'
                }
            ],
            start: '2024-01-20T11:00:00Z',
            end: '2024-01-20T16:00:00Z',
            duration: {
                value: 5,
                unit: 'hrs'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 2,
                        unit: 'hrs'
                    },
                    dateTime: '2024-01-20T09:00:00Z'
                },
                {
                    durationBefore: {
                        value: 1,
                        unit: 'days'
                    },
                    dateTime: '2024-01-19T11:00:00Z'
                }
            ],
            created: '2022-09-20T15:33:48',
            categories: [
                {
                    name: 'Paris to Peking',
                    id: 7
                },
                {
                    name: 'Maintainance',
                    id: 8
                }
            ]
        },
        {
            id: 'jP8sD3',
            name: 'Brake System Overhaul',
            vehicles: [
                {
                    id: 'MNOPQRST',
                    name: 'Mercedes-Benz 300SL'
                }
            ],
            status: [
                {
                    state: 'Done',
                    user: {
                        id: 'USR_004',
                        name: 'David Brown'
                    },
                    dateTime: '2024-01-17T11:30:00Z'
                }
            ],
            files: [
                {
                    id: '654663d2c302c20f899089c3',
                    alt: 'Mercedes-Benz 300SL Gullwing',
                    type: 'Image'
                }
            ],
            start: '2024-03-05T08:45:00Z',
            end: '2024-03-07T17:45:00Z',
            duration: {
                value: 3,
                unit: 'days'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 2,
                        unit: 'days'
                    },
                    dateTime: '2024-03-03T08:45:00Z'
                }
            ],
            created: '2022-07-23T15:34:48',
            categories: [
                {
                    name: 'Paris to Peking',
                    id: 7
                }
            ]
        },
        {
            id: 'aN0fV4',
            name: 'Leather Restoration',
            description: 'Original Connolly leather showing wear on drivers seat bolster and steering wheel. Full interior deep clean needed.',
            vehicles: [
                {
                    id: 'UVWXYZAB',
                    name: 'Aston Martin DB5'
                }
            ],
            status: [
                {
                    state: 'Pending',
                    user: {
                        id: 'USR_005',
                        name: 'James Wilson'
                    },
                    dateTime: '2024-01-18T09:15:00Z'
                },
                {
                    state: 'Done',
                    user: {
                        id: 'USR_006',
                        name: 'Richard Clark'
                    },
                    dateTime: '2024-01-18T14:20:00Z'
                }
            ],
            files: [
                {
                    id: '65465d4bc302c20f899081e6',
                    alt: 'Aston Martin DB5',
                    type: 'Document'
                }
            ],
            start: '2024-02-10T13:20:00Z',
            end: '2024-02-12T13:20:00Z',
            duration: {
                value: 2,
                unit: 'days'
            },
            alerts: [],
            created: '2022-09-13T12:47:49',
            categories: [
                {
                    name: 'Engine',
                    id: 4
                }
            ]
        },
        {
            id: 'bH6kL9',
            name: 'Valve Adjustment',
            vehicles: [
                {
                    id: 'CDEFGHIJ',
                    name: 'Lotus Elan Sprint'
                },
                {
                    id: 'KLMNOPQR',
                    name: 'Lotus Europa Twin Cam'
                }
            ],
            status: [
                {
                    state: 'Pending',
                    user: {
                        id: 'USR_007',
                        name: 'Tom Anderson'
                    },
                    dateTime: '2024-01-19T10:45:00Z'
                }
            ],
            files: [
                {
                    id: '65466480afa7da0f9649fd1f',
                    alt: 'Lotus Elan Sprint',
                    type: 'Image'
                }
            ],
            start: '2024-01-25T10:00:00Z',
            end: '2024-01-25T14:30:00Z',
            duration: {
                value: 270,
                unit: 'mins'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 30,
                        unit: 'mins'
                    },
                    dateTime: '2024-01-25T09:30:00Z'
                }
            ],
            created: '2022-08-23T15:07:33',
            categories: [
                {
                    name: 'Ferrari 250 GTO Berlietta',
                    id: 2
                },
                {
                    name: 'Engine',
                    id: 4
                }
            ]
        },
        {
            id: 'Z5rQp2',
            name: 'Coolant Flush',
            description: 'Cooling system showing signs of contamination. Radiator requires back-flushing and new coolant mixture.',
            vehicles: [],
            status: [
                {
                    state: 'Done',
                    user: {
                        id: 'USR_008',
                        name: 'Peter Hughes'
                    },
                    dateTime: '2024-01-20T16:30:00Z'
                }
            ],
            files: [
                {
                    id: '654664e4afa7da0f9649fd3c',
                    alt: 'BMW 507 Roadster',
                    type: 'Image'
                }
            ],
            start: '2024-02-15T15:45:00Z',
            end: '2024-02-15T17:45:00Z',
            duration: {
                value: 120,
                unit: 'mins'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 4,
                        unit: 'hrs'
                    },
                    dateTime: '2024-02-15T11:45:00Z'
                },
                {
                    durationBefore: {
                        value: 1,
                        unit: 'hrs'
                    },
                    dateTime: '2024-02-15T14:45:00Z'
                }
            ],
            created: '2022-08-12T10:15:02',
            categories: [
                {
                    name: 'Silverstone',
                    id: 6
                }
            ]
        },
        {
            id: 'cF7mN8',
            name: 'Electrical Diagnosis',
            vehicles: [
                {
                    id: 'STUVWXYZ',
                    name: 'Maserati 3500 GTi'
                }
            ],
            status: [
                {
                    state: 'Pending',
                    user: {
                        id: 'USR_009',
                        name: 'Robert Taylor'
                    },
                    dateTime: '2024-01-21T08:15:00Z'
                }
            ],
            files: [
                {
                    id: '65466453afa7da0f9649c2d0',
                    alt: 'Maserati 3500 GT',
                    type: 'Document'
                }
            ],
            start: '2024-03-01T09:15:00Z',
            end: '2024-03-01T16:15:00Z',
            duration: {
                value: 7,
                unit: 'hrs'
            },
            alerts: [],
            created: '2022-05-14T21:16:23',
            categories: []
        },
        {
            id: 'dD9sE1',
            name: 'Suspension Rebuild',
            description: 'Front suspension bushings worn. Complete geometry check required after replacement of all suspension components.',
            vehicles: [
                {
                    id: 'ABCDEFGH',
                    name: 'Alfa Romeo Giulia Sprint GTA'
                }
            ],
            status: [
                {
                    state: 'Pending',
                    user: {
                        id: 'USR_010',
                        name: 'Chris Martin'
                    },
                    dateTime: '2024-01-22T09:45:00Z'
                },
                {
                    state: 'Done',
                    user: {
                        id: 'USR_011',
                        name: 'Paul Davidson'
                    },
                    dateTime: '2024-01-22T15:30:00Z'
                }
            ],
            files: [
                {
                    id: '6546652cafa7da0f9649fdbb',
                    alt: 'Alfa Romeo Giulia Sprint GTA',
                    type: 'Image'
                }
            ],
            start: '2024-02-20T11:30:00Z',
            end: '2024-02-22T17:30:00Z',
            duration: {
                value: 3,
                unit: 'days'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 2,
                        unit: 'days'
                    },
                    dateTime: '2024-02-18T11:30:00Z'
                }
            ],
            created: '2023-01-07T09:08:43',
            categories: [
                {
                    name: 'Engine',
                    id: 4
                },
                {
                    name: 'Ferrari 250 GTO Berlietta',
                    id: 2
                }
            ]
        },
        {
            id: 'eE3vW6',
            name: 'Chrome Polishing',
            vehicles: [
                {
                    id: 'IJKLMNOP',
                    name: 'Jaguar XK120 Roadster'
                },
                {
                    id: 'QRSTUVWX',
                    name: 'Jaguar XK140 DHC'
                }
            ],
            status: [],
            files: [
                {
                    id: 'e59a1b1780fcd3d9b176',
                    alt: 'Jaguar XK120',
                    type: 'Image'
                }
            ],
            start: '2024-01-18T13:45:00Z',
            end: '2024-01-19T13:45:00Z',
            duration: {
                value: 1,
                unit: 'days'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 3,
                        unit: 'hrs'
                    },
                    dateTime: '2024-01-18T10:45:00Z'
                }
            ],
            created: '2023-02-27T15:57:27',
            categories: []
        },
        {
            id: 'fF4xY5',
            name: 'Gearbox Service',
            description: 'Second gear synchromesh weak. Box needs inspection for brass shavings and potential rebuild.',
            vehicles: [
                {
                    id: 'YZABCDEF',
                    name: 'MG MGA Twin Cam'
                }
            ],
            status: [
                {
                    state: 'Pending',
                    user: {
                        id: 'USR_012',
                        name: 'Alan Murray'
                    },
                    dateTime: '2024-01-23T11:20:00Z'
                }
            ],
            files: [
                {
                    id: '66365818e70ac51006d4d762',
                    alt: 'MG MGA Roadster',
                    type: 'Document'
                }
            ],
            start: '2024-02-05T10:30:00Z',
            end: '2024-02-07T16:30:00Z',
            duration: {
                value: 3,
                unit: 'days'
            },
            alerts: [],
            created: '2023-10-13T15:45:36',
            categories: [
                {
                    name: 'Ferrari 250 GTO Berlietta',
                    id: 2
                }
            ]
        },
        {
            id: 'gG5zZ4',
            name: 'Oil Change Due',
            vehicles: [],
            status: [
                {
                    state: 'Done',
                    user: {
                        id: 'USR_013',
                        name: 'Steven Richards'
                    },
                    dateTime: '2024-01-24T14:30:00Z'
                }
            ],
            files: [
                {
                    id: '6636584c44688d10012094ee',
                    alt: 'Porsche 356 Speedster',
                    type: 'Image'
                }
            ],
            start: '2024-01-22T14:00:00Z',
            end: '2024-01-22T15:30:00Z',
            duration: {
                value: 90,
                unit: 'mins'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 45,
                        unit: 'mins'
                    },
                    dateTime: '2024-01-22T13:15:00Z'
                }
            ],
            created: '2023-08-16T04:35:40',
            categories: [
                {
                    name: 'Ferrari 250 GTO Berlietta',
                    id: 2
                },
                {
                    name: 'Goodwood 2024',
                    id: 5
                },
                {
                    name: 'Engine',
                    id: 4
                },
                {
                    name: '1956 Austin-Healey 100 BN2',
                    id: 1
                }
            ]
        },
        {
            id: 'hH6aA3',
            name: 'Wheel Alignment',
            description: 'Car pulling slightly to the left under braking. Full geometry check and adjustment needed.',
            vehicles: [
                {
                    id: 'GHIJKLMN',
                    name: 'Triumph TR3A'
                }
            ],
            status: [
                {
                    state: 'Pending',
                    user: {
                        id: 'USR_014',
                        name: 'Mark Thompson'
                    },
                    dateTime: '2024-01-25T08:15:00Z'
                },
                {
                    state: 'Done',
                    user: {
                        id: 'USR_015',
                        name: 'George Wilson'
                    },
                    dateTime: '2024-01-25T16:45:00Z'
                }
            ],
            files: [
                {
                    id: '6636586de70ac51006d4d787',
                    alt: 'Triumph TR3',
                    type: 'Image'
                }
            ],
            start: '2024-02-08T09:00:00Z',
            end: '2024-02-08T12:00:00Z',
            duration: {
                value: 180,
                unit: 'mins'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 1,
                        unit: 'hrs'
                    },
                    dateTime: '2024-02-08T08:00:00Z'
                }
            ],
            created: '2022-02-23T03:32:15',
            categories: [
                {
                    name: 'Ferrari 250 GTO Berlietta',
                    id: 2
                },
                {
                    name: 'Goodwood 2024',
                    id: 5
                },
                {
                    name: 'Paris to Peking',
                    id: 7
                }
            ]
        },
        {
            id: 'iI7bB2',
            name: 'Spark Plug Replacement',
            vehicles: [
                {
                    id: 'OPQRSTUV',
                    name: 'Austin Mini Cooper S'
                },
                {
                    id: 'WXYZABCD',
                    name: 'Morris Mini Cooper S'
                }
            ],
            status: [
                {
                    state: 'Done',
                    user: {
                        id: 'USR_016',
                        name: 'Andrew Phillips'
                    },
                    dateTime: '2024-01-26T10:30:00Z'
                }
            ],
            files: [
                {
                    id: '6636589087fa1f24532a3582',
                    alt: 'Austin Mini Cooper S',
                    type: 'Document'
                }
            ],
            start: '2024-01-29T11:15:00Z',
            end: '2024-01-29T13:15:00Z',
            duration: {
                value: 120,
                unit: 'mins'
            },
            alerts: [
                {
                    durationBefore: {
                        value: 30,
                        unit: 'mins'
                    },
                    dateTime: '2024-01-29T10:45:00Z'
                }
            ],
            created: '2023-10-05T06:29:12',
            categories: [
                {
                    name: 'Silverstone',
                    id: 6
                },
                {
                    name: 'Goodwood 2024',
                    id: 5
                },
                {
                    name: 'Ferrari 250 GTO Berlietta',
                    id: 2
                }
            ]
        }
    ];
}
