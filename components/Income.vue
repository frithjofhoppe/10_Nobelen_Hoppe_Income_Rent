<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomeData, useRegionCantonMapping, type RegionCantonMapping, type ResultEntry } from '@/composable/data'
import type { SwitzerlandMapEntry } from './SwitzerlandCantonsMap.vue'
import { Income } from '#components'

const { data } = useIncomeData()

// Reactive filters — now single values
const selectedEducation = ref<string | null>(null)
const selectedPosition = ref<string | null>(null)
const selectedGender = ref<string | null>(null)
const selectedRoomOption = ref<string | null>(null);

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
    console.log(JSON.stringify(data.value))
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
  <section class="min-h-screen p-10 flex flex-col justify-center items-center bg-gray-50">
    <h2 class="text-3xl font-semibold mb-4">Einkommen nach Berufsfeld</h2>


    <div id="map" class="w-full max-w-4xl h-auto border border-gray-200 p-4">
      <div class="mb-6 grid grid-cols-3 gap-4">

        <!-- Ausbildung -->
        <div>
          <label class="font-medium">Ausbildung</label>
          <div v-for="item in uniqueEducations" :key="item">
            <label>
              <input type="radio" name="education" :value="item" v-model="selectedEducation" />
              {{ item }}
            </label>
          </div>
        </div>

        <!-- Berufliche Stellung -->
        <div>
          <label class="font-medium">Berufliche Stellung</label>
          <div v-for="item in uniquePositions" :key="item">
            <label>
              <input type="radio" name="position" :value="item" v-model="selectedPosition" />
              {{ item }}
            </label>
          </div>
        </div>

        <!-- Geschlecht -->
        <div>
          <label class="font-medium">Geschlecht</label>
          <div v-for="item in uniqueGenders" :key="item">
            <label>
              <input type="radio" name="gender" :value="item" v-model="selectedGender" />
              {{ item }}
            </label>
          </div>
        </div>

      </div>
    </div>

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

    <div class="w-full h-200 max-w-4xl p-4 mb-6">
      <client-only>
        <template #fallback>
          <div class="w-full h-64 flex items-center justify-center text-gray-500">
            Lädt Karte...
          </div>
        </template>
        <SwitzerlandCantonsMap v-if="filteredData && areFiltersApplied" class="w-full h-full"
          :data="mapping.map(mapRegionToCanton(filteredData))" />
      </client-only>
    </div>

  </section>
</template>
