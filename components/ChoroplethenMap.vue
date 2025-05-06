<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomeData, GeographicRegion } from '@/composable/data'

const { data, pending, error } = useIncomeData()

// Reactive filters
const selectedEducations = ref<string[]>([])
const selectedPositions = ref<string[]>([])
const selectedGenders = ref<string[]>([])

const allEntries = computed(() => data.value?.entries ?? [])

const uniqueEducations = computed(() => data.value?.educations ?? [])
const uniquePositions = computed(() => data.value?.professionalPositions ?? [])
const uniqueGenders = computed(() => data.value?.genders ?? [])

const filteredData = computed(() => {
  return allEntries.value.filter(entry => {
    const matchEducation = selectedEducations.value.length === 0 || selectedEducations.value.includes(entry.education)
    const matchPosition = selectedPositions.value.length === 0 || selectedPositions.value.includes(entry.professionalPosition)
    const matchGender = selectedGenders.value.length === 0 || selectedGenders.value.includes(entry.gender)
    return matchEducation && matchPosition && matchGender
  })
})

const areFiltersApplied = computed(() => {
  return selectedEducations.value.length > 0 && selectedPositions.value.length > 0 && selectedGenders.value.length > 0
})
  
</script>

<template>
  <section class="min-h-screen p-10 flex flex-col justify-center items-center">
    <h2 class="text-3xl font-semibold mb-4">Regionale Mietpreisunterschiede</h2>
    
    <div id="map" class="w-full max-w-4xl h-auto border border-gray-200 p-4">
      <div class="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label class="font-medium">Ausbildung</label>
          <div v-for="item in uniqueEducations" :key="item">
            <label>
              <input v-model="selectedEducations" type="checkbox" :value="item">
              {{ item }}
            </label>
          </div>
        </div>

        <div>
          <label class="font-medium">Berufliche Stellung</label>
          <div v-for="item in uniquePositions" :key="item">
            <label>
              <input v-model="selectedPositions" type="checkbox" :value="item">
              {{ item }}
            </label>
          </div>
        </div>

        <div>
          <label class="font-medium">Geschlecht</label>
          <div v-for="item in uniqueGenders" :key="item">
            <label>
              <input v-model="selectedGenders" type="checkbox" :value="item">
              {{ item }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredData" class="w-full h-200 max-w-4xl p-4 mb-6">
      <SwitzerlandCantonsMap v-if="filteredData && areFiltersApplied" class="w-full h-full" :data="filteredData"/>
    </div>
  </section>
</template>