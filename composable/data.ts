//Like a service layer
import axios from 'axios';

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