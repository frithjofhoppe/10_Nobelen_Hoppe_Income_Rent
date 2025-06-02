<template>
  <div class="min-h-screen p-10 flex flex-col justify-center items-center bg-gray-50">
    <MotionSection>
    <h2 id="income" class="text-4xl font-semibold mb-8 mx-auto max-w-4xl">Einkommen nach Berufsfeld</h2>
    </MotionSection>
    <MotionSection section-class="w-full mx-auto max-w-4xl">
      <div class="mb-6 grid grid-cols-3 gap-4">
        <!-- Ausbildung -->
        <div>
          <label class="font-medium" for="education-select">Ausbildung</label>
          <select id="education-select" v-model="selectedEducation" class="w-full mt-2 p-2 border rounded">
            <option v-for="item in uniqueEducations" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <!-- Berufliche Stellung -->
        <div class="mx-auto max-w-4xl">
          <label class="font-medium" for="position-select">Berufliche Stellung</label>
          <select id="position-select" v-model="selectedPosition" class="w-full mt-2 p-2 border rounded">
            <option v-for="item in uniquePositions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <!-- Geschlecht -->
        <div>
          <label class="font-medium" for="gender-select">Geschlecht</label>
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
        Die Einkommen in der Schweiz variieren stark in Abhängigkeit von Ausbildungsstand und geografischer Region.
        Personen mit universitärem Abschluss (z. B. UNI, ETH) erzielen die höchsten Medianlöhne, insbesondere in
        Kaderpositionen. So verdienen Männer im oberen Kader in Zürich durchschnittlich CHF 14'990, in der Zentralschweiz
        sogar CHF 15'391, während Frauen mit gleicher Ausbildung und Position etwas weniger, aber ebenfalls hohe Werte
        erreichen (z. B. CHF 13'400 in der Zentralschweiz).
      </p>

      <p>
        Mit sinkendem Ausbildungsniveau nehmen die Einkommen ab. Personen mit abgeschlossener Berufsausbildung ohne
        Kaderfunktion verdienen je nach Region zwischen rund CHF 5'100 (Tessin, Frauen) und CHF 6'900 (Zürich, Männer).
        Auch die unternehmensinterne Ausbildung schneidet am schlechtesten ab – insbesondere im Tessin mit Löhnen um CHF
        3'800 bis CHF 5'000, was deutlich unter dem Schweizer Durchschnitt liegt.
      </p>

      <p>
        Geografisch sticht Zürich durchgehend mit den höchsten Einkommen hervor, gefolgt von der Zentralschweiz und der
        Nordwestschweiz. In der Westschweiz (Région lémanique) und im Espace Mittelland liegen die Einkommen im
        Mittelfeld, während das Tessin klar das Schlusslicht bildet – selbst für hochqualifizierte Personen. Dies gilt für
        beide Geschlechter und alle Positionen.
      </p>

      <p>
        Eine auffällige Beobachtung: Männer verdienen in allen Regionen und Ausbildungsstufen systematisch mehr als
        Frauen, selbst bei gleicher Qualifikation und Funktion. Dieser Gender Pay Gap ist besonders in Kaderpositionen
        sichtbar.
      </p>

      <p>
        Zusammenfassend lässt sich sagen: Bildung lohnt sich in der Schweiz eindeutig, sowohl in Bezug auf Kaderchancen
        als auch auf Einkommen. Gleichzeitig zeigt sich ein deutliches Stadt-Land- und Nord-Süd-Gefälle sowie ein
        anhaltendes geschlechtsspezifisches Lohnungleichgewicht.
      </p>
    </MotionSection>
    <div class="w-full h-200 max-w-4xl p-4 mb-6">
      <client-only>
        <template #fallback>
          <div class="w-full h-64 flex items-center justify-center text-gray-500">
            Lädt Karte...
          </div>
        </template>
        <SwitzerlandCantonsMap
          v-if="filteredData && areFiltersApplied" class="size-full"
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
