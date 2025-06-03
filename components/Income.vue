<template>
  <div class="min-h-screen p-10 flex flex-col justify-center items-center bg-gray-50 gap-5">
    <MotionSection>
      <h2 id="income" class="text-4xl font-semibold mb-8 mx-auto max-w-4xl">Income by education and position</h2>
    </MotionSection>
    <MotionSection section-class="mx-auto max-w-4xl">
      <div class="space-y-4">
        <p>
          The second section is about income. Our graphic lets you filter by region, gender, and education level—and
          discover how your position affects your salary.
        </p>
        <p>
          Top earners with a university degree and a management position earn up to CHF 15,000 gross per month in Zurich
          and Central Switzerland. But those who “only” have vocational training quickly end up earning between CHF
          5,500 and CHF 6,500 – and in Ticino often significantly less. And women? They consistently earn less. Example:
          In northwestern Switzerland, a woman with vocational training and no management position takes home an average
          of CHF 5,200 – around CHF 1,000 less than her male counterpart.
        </p>
        <p>
          👉 Play around with the selection – you will quickly see which factors really matter.
        </p>
      </div>
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
