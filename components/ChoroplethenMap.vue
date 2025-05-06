<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomeData } from '@/composable/data'

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

const areFiltersApplied = computed(() => {
  return !!(selectedEducation.value && selectedPosition.value && selectedGender.value)
})


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

    <div class="w-full h-200 max-w-4xl p-4 mb-6">
      <client-only>
        <template #fallback>
          <div class="w-full h-64 flex items-center justify-center text-gray-500">
            Lädt Karte...
          </div>
        </template>
        <SwitzerlandCantonsMap
          v-if="filteredData && areFiltersApplied"
          class="w-full h-full"
          :data="filteredData"
        />
      </client-only>
    </div>
  </section>
</template>
