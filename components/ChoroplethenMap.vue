<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRentPriceData } from '@/composable/data'
import type { SwitzerlandMapEntry } from './SwitzerlandCantonsMap.vue'

const rentPrices = useRentPriceData()

// Reactive filters — now single values
const selectedRoomOption = ref<string | null>(null);
const uniqueRoomOptions = computed(() => new Set(rentPrices.flatMap(entry => entry.prices.map(price => price.nofRooms))));

const filteredRentData = computed(
  () => {
    return rentPrices
      .filter(x => x.prices.some(price => price.nofRooms === selectedRoomOption.value))
      .map(x => {
        const cantonEntry = x.prices.find(price => price.nofRooms === selectedRoomOption.value)
        return {
          value: cantonEntry ? cantonEntry.avgPrice : 'NaN',
          cantonCode: x.cantonCode
        } as SwitzerlandMapEntry
      })
  }
)

const areFiltersApplied = computed(() => {
  return !!(selectedRoomOption.value)
})

watchEffect(() => {
  if (rentPrices) {
    if (!selectedRoomOption.value && uniqueRoomOptions.value.size) {
      selectedRoomOption.value = Array.from(uniqueRoomOptions.value)[0]
    }
  }
})

</script>

<template>
  <section class="min-h-screen p-10 flex flex-col justify-center items-center mx-auto max-w-4xl">
    <h2 class="text-3xl font-semibold mb-4">Mietpreise nach Kanton</h2>
    <div id="map" class="w-full">
      <div class="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label class="font-medium">Anzahl an Zimmern</label>
          <select v-model="selectedRoomOption" class="border border-gray-300 rounded p-2 w-full">
            <option v-for="item in uniqueRoomOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        
      </div>
    </div>

    <p>
      Die Mietpreise in der Schweiz variieren je nach Zimmeranzahl deutlich. Für Einzimmerwohnungen liegt der
      Durchschnittspreis kantonsübergreifend zwischen ca. CHF 540 (Jura) und CHF 1'050 (Zürich). Mit zunehmender
      Zimmeranzahl steigen die Preise erwartungsgemäss an. So kosten 2-Zimmer-Wohnungen durchschnittlich zwischen rund
      CHF 760 (JU) und CHF 1'460 (ZH/ZG), während 6-Zimmer-Wohnungen und grösser Preise bis zu CHF 3'391 (ZG) erreichen.
    </p>
    <p>
      Auffällig ist der steile Preisanstieg in den Kantonen Zürich (ZH), Zug (ZG), Waadt (VD) und Genf (GE), besonders
      bei grösseren Wohnungen. In diesen Kantonen überschreiten die Durchschnittspreise für 6-Zimmer-Wohnungen teils
      deutlich die CHF 2'800-Marke. Zug ist dabei Spitzenreiter mit CHF 3'391, gefolgt von Zürich mit CHF 3'000. Im
      Gegensatz dazu bleiben die Preise in ländlicheren Kantonen wie Jura, Uri oder Wallis deutlich unter diesen Werten.
    </p>

    <p>
      Ein weiteres interessantes Muster ist die vergleichsweise geringe Preissteigerung in einigen Kantonen bei
      grösseren Wohnungen. Beispielsweise ist der Unterschied zwischen 4- und 5-Zimmer-Wohnungen in Appenzell
      Ausserrhoden (AR) oder Glarus (GL) moderat, was auf ein geringeres Angebot oder eine schwächere Nachfrage nach
      grossen Wohnungen hinweisen könnte.
    </p>

    <p>
      Einige Kantone wie Appenzell Innerrhoden (AI) oder Nidwalden (NW) zeigen Lücken bei den Einzimmerwohnungen, was
      auf eine geringe Anzahl entsprechender Angebote hindeutet. Diese Datenlücken können die Vergleichbarkeit leicht
      beeinträchtigen.
    </p>
    <p>
      Insgesamt lässt sich sagen: Die Mietpreise steigen mit der Wohnungsgrösse an, jedoch nicht linear. Regionale
      Unterschiede sind erheblich – städtische und wirtschaftlich starke Kantone sind teurer, ländliche Regionen
      hingegen erschwinglicher. Besonders bei grossen Wohnungen ist das Preisgefälle zwischen Stadt- und Landkantonen
      deutlich ausgeprägt.
    </p>

    <div class="w-full h-200 max-w-4xl p-4 mb-6">
      <client-only>
        <template #fallback>
          <div class="w-full h-64 flex items-center justify-center text-gray-500">
            Lädt Karte...
          </div>
        </template>
        <SwitzerlandCantonsMap
v-if="filteredRentData && areFiltersApplied" class="w-full h-full"
          :data="filteredRentData" />
      </client-only>
    </div>
  </section>
</template>
