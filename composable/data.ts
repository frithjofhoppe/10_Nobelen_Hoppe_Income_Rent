//Like a service layer


interface IncomeResultSet {
    entries: ResultEntry[],
    geographicRegions: string[],
    educations: string[],
    professionalPositions: string[],
    genders: string[],
}

export interface ResultEntry {
    // Rows
    region: GeographicRegion, // Grossregion CH
    education: string, // Abschluss
    professionalPosition: string, // Kaderfunktion
    gender: string,

    // Columns
    value: DataValue
}

export enum GeographicRegion {
    Westschweiz = 'Région lémanique',
    Mittelland = 'Espace Mittelland',
    Nordwestschweiz = 'Nordwestschweiz',
    Zuerich = 'Zürich',
    Ostschweiz = 'Ostschweiz',
    Zentralschweiz = 'Zentralschweiz',
    Tessin = 'Ticino'
}

interface DataValue {
    centralValue: string,
    p10: string,
    p25: string,
    p75: string,
    p90: string
}


export interface RegionCantonMapping {
    cantonCode: string,
    cantonName: string,
    regionName: GeographicRegion
}

interface CantonRentPrice {
    cantonCode: string,
    prices: RoomRentPrice[]
}

interface RoomRentPrice {
    nofRooms: string,
    avgPrice: number,
}

export function useRegionCantonMapping() {
    return [
        {cantonCode: 'GE', cantonName: 'Genf', regionName: GeographicRegion.Westschweiz},
        {cantonCode: 'VD', cantonName: 'Waadt', regionName: GeographicRegion.Westschweiz},
        {cantonCode: 'NE', cantonName: 'Neuenburg', regionName: GeographicRegion.Westschweiz},
        {cantonCode: 'FR', cantonName: 'Freiburg', regionName: GeographicRegion.Westschweiz},
        {cantonCode: 'VS', cantonName: 'Wallis', regionName: GeographicRegion.Westschweiz},
        {cantonCode: 'BE', cantonName: 'Bern', regionName: GeographicRegion.Mittelland},
        {cantonCode: 'SO', cantonName: 'Solothurn', regionName: GeographicRegion.Mittelland},
        {cantonCode: 'LU', cantonName: 'Luzern', regionName: GeographicRegion.Mittelland},
        {cantonCode: 'BS', cantonName: 'Basel-Stadt', regionName: GeographicRegion.Nordwestschweiz},
        {cantonCode: 'BL', cantonName: 'Basel-Landschaft', regionName: GeographicRegion.Nordwestschweiz},
        {cantonCode: 'AG', cantonName: 'Aargau', regionName: GeographicRegion.Nordwestschweiz},
        {cantonCode: 'JU', cantonName: 'Jura', regionName: GeographicRegion.Nordwestschweiz},
        {cantonCode: 'ZH', cantonName: 'Zürich', regionName: GeographicRegion.Zuerich},
        {cantonCode: 'SH', cantonName: 'Schaffhausen', regionName: GeographicRegion.Ostschweiz},
        {cantonCode: 'SG', cantonName: 'St.Gallen', regionName: GeographicRegion.Ostschweiz},
        {cantonCode: 'TG', cantonName: 'Thurgau', regionName: GeographicRegion.Ostschweiz},
        {cantonCode: 'AI', cantonName: 'Appenzell I.Rh.', regionName: GeographicRegion.Ostschweiz},
        {cantonCode: 'AR', cantonName: 'Appenzell A.Rh.', regionName: GeographicRegion.Ostschweiz},
        {cantonCode: 'GL', cantonName: 'Glarus', regionName: GeographicRegion.Ostschweiz},
        {cantonCode: 'GR', cantonName: 'Graubünden', regionName: GeographicRegion.Ostschweiz},
        {cantonCode: 'ZG', cantonName: 'Zug', regionName: GeographicRegion.Zentralschweiz},
        {cantonCode: 'OW', cantonName: 'Obwalden', regionName: GeographicRegion.Zentralschweiz},
        {cantonCode: 'NW', cantonName: 'Nidwalden', regionName: GeographicRegion.Zentralschweiz},
        {cantonCode: 'UR', cantonName: 'Uri', regionName: GeographicRegion.Zentralschweiz},
        {cantonCode: 'SZ', cantonName: 'Schwyz', regionName: GeographicRegion.Zentralschweiz},
        {cantonCode: 'TI', cantonName: 'Tessin', regionName: GeographicRegion.Tessin},
    ] as RegionCantonMapping[];
}

export function useRentPriceData() {
    return cantonData as CantonRentPrice[];
}

export function useIncomeData() {
    return useAsyncData<IncomeResultSet>('bfs-income-data', async () => {
        try {
            const res = await $fetch('https://www.pxweb.bfs.admin.ch/api/v1/de/px-x-0304010000_202/px-x-0304010000_202.px', {
                method: 'POST',
                body: {
                    query: [
                        { code: 'Jahr', selection: { filter: 'item', values: ['2022'] } },
                        { code: 'Grossregion', selection: { filter: 'item', values: ['1', '2', '3', '4', '5', '6', '7'] } },
                        { code: 'Ausbildung', selection: { filter: 'item', values: ['1', '2', '3', '4', '5', '6', '7'] } },
                        { code: 'Berufliche Stellung', selection: { filter: 'item', values: ['0', '3', '4', '5'] } },
                        { code: 'Geschlecht', selection: { filter: 'item', values: ['1', '2'] } }
                    ],
                    response: { format: 'json-stat' }
                }
            });

            const dimension = res.dataset.dimension;
            const values = res.dataset.value;

            const regions = dimension['Grossregion'].category.label;
            const educations = dimension['Ausbildung'].category.label;
            const professionalPositions = dimension['Berufliche Stellung'].category.label;
            const genders = dimension['Geschlecht'].category.label;

            const regionKeys = Object.keys(regions);
            const educationKeys = Object.keys(educations);
            const positionKeys = Object.keys(professionalPositions);
            const genderKeys = Object.keys(genders);

            const entries: ResultEntry[] = [];
            let i = 0;

            for (const regionKey of regionKeys) {
                for (const educationKey of educationKeys) {
                    for (const positionKey of positionKeys) {
                        for (const genderKey of genderKeys) {
                            entries.push({
                                region: regions[regionKey],
                                education: educations[educationKey],
                                professionalPosition: professionalPositions[positionKey],
                                gender: genders[genderKey],
                                value: {
                                    centralValue: values[i++]?.toString() ?? 'NaN',
                                    p10: values[i++]?.toString() ?? 'NaN',
                                    p25: values[i++]?.toString() ?? 'NaN',
                                    p75: values[i++]?.toString() ?? 'NaN',
                                    p90: values[i++]?.toString() ?? 'NaN',
                                }
                            });
                        }
                    }
                }
            }

            const reslut = {
                entries: entries,
                geographicRegions: Object.values(regions),
                educations: Object.values(educations),
                professionalPositions: Object.values(professionalPositions),
                genders: Object.values(genders)
            } as IncomeResultSet;

            return reslut;
        } catch (err) {
            console.error(err)
            throw err
        }
    });
}

const cantonData: CantonRentPrice[] = [
    {
        "cantonCode": "AG",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 828.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1170.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1398.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1647.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1919.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2244.0
            }
        ]
    },
    {
        "cantonCode": "AR",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 650.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 949.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1273.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1281.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1701.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 1917.0
            }
        ]
    },
    {
        "cantonCode": "AI",
        "prices": [
            {
                "nofRooms": "2",
                "avgPrice": 1026.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1253.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1532.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1714.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2202.0
            }
        ]
    },
    {
        "cantonCode": "BL",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 830.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1182.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1400.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1743.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2113.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2825.0
            }
        ]
    },
    {
        "cantonCode": "BS",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 864.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1139.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1399.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1894.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2404.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2873.0
            }
        ]
    },
    {
        "cantonCode": "BE",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 779.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1053.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1244.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1512.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1804.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2283.0
            }
        ]
    },
    {
        "cantonCode": "FR",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 732.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1047.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1265.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1502.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1841.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2044.0
            }
        ]
    },
    {
        "cantonCode": "GE",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 997.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1206.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1452.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1680.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2034.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2784.0
            }
        ]
    },
    {
        "cantonCode": "GL",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 741.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 968.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1153.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1349.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1744.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 1996.0
            }
        ]
    },
    {
        "cantonCode": "GR",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 733.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1120.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1372.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1552.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1695.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 1815.0
            }
        ]
    },
    {
        "cantonCode": "JU",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 542.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 762.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 926.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1108.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1350.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 1391.0
            }
        ]
    },
    {
        "cantonCode": "LU",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 828.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1168.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1395.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1596.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1954.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2383.0
            }
        ]
    },
    {
        "cantonCode": "NE",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 665.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 850.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1010.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1269.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1583.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 1995.0
            }
        ]
    },
    {
        "cantonCode": "NW",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 737.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1162.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1449.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1787.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2074.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2235.0
            }
        ]
    },
    {
        "cantonCode": "OW",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 679.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1100.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1328.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1558.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1814.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2225.0
            }
        ]
    },
    {
        "cantonCode": "SH",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 795.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1061.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1189.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1400.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1840.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2168.0
            }
        ]
    },
    {
        "cantonCode": "SZ",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 861.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1283.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1647.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1854.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2278.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2801.0
            }
        ]
    },
    {
        "cantonCode": "SO",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 732.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1044.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1185.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1427.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1743.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2051.0
            }
        ]
    },
    {
        "cantonCode": "SG",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 743.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1043.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1295.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1461.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1715.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 1996.0
            }
        ]
    },
    {
        "cantonCode": "TI",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 778.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1032.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1216.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1465.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1842.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2127.0
            }
        ]
    },
    {
        "cantonCode": "TG",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 764.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1075.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1280.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1493.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1766.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2153.0
            }
        ]
    },
    {
        "cantonCode": "UR",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 678.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1009.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1174.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1372.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1577.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 1848.0
            }
        ]
    },
    {
        "cantonCode": "VD",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 866.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1161.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1457.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1794.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2197.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2915.0
            }
        ]
    },
    {
        "cantonCode": "VS",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 725.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 994.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1241.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1430.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 1661.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 2116.0
            }
        ]
    },
    {
        "cantonCode": "ZG",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 929.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1465.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1813.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 2183.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2661.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 3391.0
            }
        ]
    },
    {
        "cantonCode": "ZH",
        "prices": [
            {
                "nofRooms": "1",
                "avgPrice": 1054.0
            },
            {
                "nofRooms": "2",
                "avgPrice": 1461.0
            },
            {
                "nofRooms": "3",
                "avgPrice": 1681.0
            },
            {
                "nofRooms": "4",
                "avgPrice": 1971.0
            },
            {
                "nofRooms": "5",
                "avgPrice": 2404.0
            },
            {
                "nofRooms": "6+",
                "avgPrice": 3000.0
            }
        ]
    }
]