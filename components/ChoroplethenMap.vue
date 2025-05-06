<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomeData, GeographicRegion } from '@/composable/data'

const { data, pending, error } = useIncomeData()

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

const areFiltersApplied = computed(() => {
  return !!(selectedEducation.value && selectedPosition.value && selectedGender.value)
})
</script>

<template>
  <section class="min-h-screen p-10 flex flex-col justify-center items-center">
    <h2 class="text-3xl font-semibold mb-4">Einkommen nach Kanton</h2>
    <div id="map" class="w-full max-w-4xl h-auto border border-gray-200 p-4">
      <div class="mb-6 grid grid-cols-3 gap-4">

        <!-- Ausbildung -->
        <div>
          <label class="font-medium">Ausbildung</label>
          <div v-for="item in uniqueEducations" :key="item">
            <label>
              <input
                type="radio"
                name="education"
                :value="item"
                v-model="selectedEducation"
              />
              {{ item }}
            </label>
          </div>
        </div>

        <!-- Berufliche Stellung -->
        <div>
          <label class="font-medium">Berufliche Stellung</label>
          <div v-for="item in uniquePositions" :key="item">
            <label>
              <input
                type="radio"
                name="position"
                :value="item"
                v-model="selectedPosition"
              />
              {{ item }}
            </label>
          </div>
        </div>

        <!-- Geschlecht -->
        <div>
          <label class="font-medium">Geschlecht</label>
          <div v-for="item in uniqueGenders" :key="item">
            <label>
              <input
                type="radio"
                name="gender"
                :value="item"
                v-model="selectedGender"
              />
              {{ item }}
            </label>
          </div>
        </div>

      </div>
    </div>

    <div v-if="filteredData" class="w-full h-200 max-w-4xl p-4 mb-6">
      <SwitzerlandCantonsMap
        v-if="filteredData && areFiltersApplied"
        class="w-full h-full"
        :data="filteredData"
      />
      <p v-if="!areFiltersApplied">
        No filter applied. Please select some
      </p>
    </div>
  </section>
</template>
