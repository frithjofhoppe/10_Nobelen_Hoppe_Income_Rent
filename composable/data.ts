//Like a service layer


interface IncomeResultSet {
    entries: ResultEntry[],
    geographicRegions: string[],
    educations: string[],
    professionalPositions: string[],
    genders: string[],
}

interface ResultEntry {
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


interface RegionCantonMapping {
    regionName: GeographicRegion,
    cantonName: string[]
}

interface CantonRentPrice {
    cantonName: string,
    prices: RoomRentPrice[]
}

interface RoomRentPrice {
    nofRooms: string,
    avgPrice: number,
}

export function useRegionCantonMapping() {
    return [
        {
            regionName: GeographicRegion.Westschweiz,
            cantonName: ['Genf', 'Waadt', 'Neuenburg', 'Freiburg', 'Wallis']
        },
        {
            regionName: GeographicRegion.Mittelland,
            cantonName: ['Bern', 'Solothurn', 'Aargau', 'Luzern']
        },
        {
            regionName: GeographicRegion.Nordwestschweiz,
            cantonName: ['Basel-Stadt', 'Basel-Landschaft', 'Aargau']
        },
        {
            regionName: GeographicRegion.Zuerich,
            cantonName: ['Zürich']
        },
        {
            regionName: GeographicRegion.Ostschweiz,
            cantonName: ['St.Gallen', 'Thurgau', 'Appenzell I.Rh.', 'Appenzell A.Rh.', 'Glarus', 'Graubünden']
        },
        {
            regionName: GeographicRegion.Zentralschweiz,
            cantonName: ['Zug', 'Obwalden', 'Nidwalden']
        },
        {
            regionName: GeographicRegion.Tessin,
            cantonName: ['Tessin']
        }
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
                            console.log(">> entry");
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
        "cantonName": "Aargau",
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
        "cantonName": "Appenzell A.Rh.",
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
        "cantonName": "Appenzell I.Rh.",
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
        "cantonName": "Basel-Landschaft",
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
        "cantonName": "Basel-Stadt",
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
        "cantonName": "Bern",
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
        "cantonName": "Freiburg",
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
        "cantonName": "Genf",
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
        "cantonName": "Glarus",
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
        "cantonName": "Graubünden",
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
        "cantonName": "Jura",
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
        "cantonName": "Luzern",
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
        "cantonName": "Neuenburg",
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
        "cantonName": "Nidwalden",
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
        "cantonName": "Obwalden",
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
        "cantonName": "Schaffhausen",
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
        "cantonName": "Schwyz",
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
        "cantonName": "Solothurn",
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
        "cantonName": "St.Gallen",
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
        "cantonName": "Tessin",
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
        "cantonName": "Thurgau",
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
        "cantonName": "Uri",
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
        "cantonName": "Waadt",
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
        "cantonName": "Wallis",
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
        "cantonName": "Zug",
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
        "cantonName": "Zürich",
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