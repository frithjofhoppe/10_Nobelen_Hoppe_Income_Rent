<template>
  <div class="min-h-screen p-10 flex flex-col justify-center items-center bg-gray-50">
    <MotionSection>
      <h2 id="income" class="text-4xl font-semibold mb-8 mx-auto max-w-4xl">Income by education and position</h2>
    </MotionSection>
    <MotionSection section-class="w-full mx-auto max-w-4xl">
      <div class="mb-6 grid grid-cols-3 gap-4">
        <!-- Ausbildung -->
        <div>
          <label class="font-medium" for="education-select">Education</label>
          <select id="education-select" v-model="selectedEducation" class="w-full mt-2 p-2 border rounded">
            <option v-for="item in uniqueEducations" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <!-- Berufliche Stellung -->
        <div class="mx-auto max-w-4xl">
          <label class="font-medium" for="position-select">Professional position</label>
          <select id="position-select" v-model="selectedPosition" class="w-full mt-2 p-2 border rounded">
            <option v-for="item in uniquePositions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <!-- Geschlecht -->
        <div>
          <label class="font-medium" for="gender-select">Gender</label>
          <select id="gender-select" v-model="selectedGender" class="w-full mt-2 p-2 border rounded">
            <option v-for="item in uniqueGenders" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
      </div>
    </MotionSection>
    <MotionSection section-class="mx-auto max-w-4xl">
      <p>
        Income in Switzerland varies greatly depending on educational attainment and geographical region.
        People with a university degree (e.g., UNI, ETH) earn the highest median wages, especially in
        management positions. For example, men in upper management in Zurich earn an average of CHF 14,990, in Central
        Switzerland
        even CHF 15,391, while women with the same education and position earn slightly less, but still high amounts
        (e.g., CHF 13,400 in Central Switzerland).
      </p>
      <p>
      Income decreases as the level of education declines. Individuals with completed vocational training but without
        management positions earn between around CHF 5,100 (Ticino, women) and CHF 6,900 (Zurich, men), depending on the region.
        In-house training also performs worst, especially in Ticino, with wages of around CHF
        3,800 to CHF 5,000, which is significantly below the Swiss average.
      </p>
      <p>
        Geographically, Zurich consistently stands out with the highest incomes, followed by Central Switzerland and Northwestern Switzerland. In Western Switzerland (Région lémanique) and the Espace Mittelland, incomes are in the midfield, while Ticino clearly brings up the rear – even for highly qualified individuals. This applies to both genders and all positions.
      </p>
      <p>
        A striking observation: Men systematically earn more than women in all regions and educational levels, even with the same qualifications and functions. This gender pay gap is particularly evident in management positions.
      </p>
      <p>
        In summary, it can be said: Education clearly pays off in Switzerland, both in terms of management opportunities and income. At the same time, a clear urban-rural and north-south divide, as well as a persistent gender-specific wage imbalance, are evident.
      </p>
    </MotionSection>
    <div class="w-full h-200 max-w-4xl p-4 mb-6">
      <client-only>
        <template #fallback>
          <div class="w-full h-64 flex items-center justify-center text-gray-500">
            Lädt Karte...
          </div>
        </template>
        <SwitzerlandCantonsMap v-if="filteredData && areFiltersApplied" class="size-full"
          :data="mapping.map(mapRegionToCanton(filteredData))" />
      </client-only>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomeData, useRegionCantonMapping, type RegionCantonMapping, type ResultEntry } from '@/composable/data'
import type { SwitzerlandMapEntry } from './SwitzerlandCantonsMap.vue'

const { data } = useIncomeData()

// Reactive filters — now single values
const selectedEducation = ref<string | null>(null)
const selectedPosition = ref<string | null>(null)
const selectedGender = ref<string | null>(null)
const allEntries = computed(() => data.value?.entries ?? [])

const uniqueEducations = computed(() => data.value?.educations ?? [])
const uniquePositions = computed(() => data.value?.professionalPositions ?? [])
const uniqueGenders = computed(() => data.value?.genders ?? [])

const filteredData = computed(() => {
  return allEntries.value.filter(entry => {
    const matchEducation = !selectedEducation.value || entry.education === selectedEducation.value
    const matchPosition = !selectedPosition.value || entry.professionalPosition === selectedPosition.value
    const matchGender = !selectedGender.value || entry.gender === selectedGender.value
    return matchEducation && matchPosition && matchGender
  })
})

const mapping = useRegionCantonMapping()

const areFiltersApplied = computed(() => {
  return !!(selectedEducation.value && selectedPosition.value && selectedGender.value)
})

const mapRegionToCanton = (filteredData: ResultEntry[]) => (entry: RegionCantonMapping) => {
  const cantonEntry = filteredData.find(x => x.region === entry.regionName)
  return {
    value: cantonEntry ? cantonEntry.value.centralValue : 'NaN',
    cantonCode: entry.cantonCode
  } as SwitzerlandMapEntry
}


watchEffect(() => {
  if (data.value) {
    if (!selectedEducation.value && data.value.educations?.length) {
      selectedEducation.value = data.value.educations[0]
    }
    if (!selectedPosition.value && data.value.professionalPositions?.length) {
      selectedPosition.value = data.value.professionalPositions[0]
    }
    if (!selectedGender.value && data.value.genders?.length) {
      selectedGender.value = data.value.genders[0]
    }
  }
})

</script>
