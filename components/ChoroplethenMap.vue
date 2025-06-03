<template>
  <div class="min-h-screen p-10 flex flex-col justify-center items-center mx-auto max-w-4xl">
    <MotionSection>
      <h2 id="rent-canton" class="text-4xl font-semibold mb-8">Rent prices per canton</h2>
    </MotionSection>
    <MotionSection section-class="w-full">
      <div class="mb-6 grid grid-cols-3 gap-4">
        <div>
          <label class="font-medium">Number of rooms</label>
          <select v-model="selectedRoomOption" class="border border-gray-300 rounded p-2 w-full">
            <option v-for="item in uniqueRoomOptions" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

      </div>
    </MotionSection>
    <MotionSection>
      <p>
        Rental prices in Switzerland vary significantly depending on the number of rooms. For one-room apartments, the
        average price across cantons ranges from around CHF 540 (Jura) to CHF 1,050 (Zurich). As the
        number of rooms increases, prices rise as expected. Two-room apartments cost an average of around
        CHF 760 (JU) and CHF 1,460 (ZH/ZG), while six-room apartments and larger ones can cost up to CHF 3,391 (ZG).
      </p>
      <p>
        The sharp rise in prices in the cantons of Zurich (ZH), Zug (ZG), Vaud (VD), and Geneva (GE) is striking,
        especially
        for larger apartments. In these cantons, the average prices for 6-room apartments sometimes
        significantly exceed the CHF 2,800 mark. Zug is the frontrunner with CHF 3,391, followed by Zurich with CHF
        3,000. In
        contrast, prices in more rural cantons such as Jura, Uri, and Valais remain well below these figures.
      </p>

      <p>
        Another interesting pattern is the comparatively low price increase in some cantons for
        larger apartments. For example, the difference between 4- and 5-room apartments in Appenzell
        Ausserrhoden (AR) or Glarus (GL) is moderate, which could indicate lower supply or weaker demand for
        large apartments.
      </p>

      <p>
        Some cantons, such as Appenzell Innerrhoden (AI) and Nidwalden (NW), show gaps in the data for one-room
        apartments, which
        indicates a low number of such properties on offer. These data gaps can slightly impair comparability.
      </p>
      <p>
        Overall, it can be said that rental prices rise with the size of the apartment, but not linearly. Regional
        differences are considerable – urban and economically strong cantons are more expensive, while rural regions
        are more affordable. The price gap between urban and rural cantons is particularly pronounced for large
        apartments.
      </p>
    </MotionSection>
    <div class="w-full h-200 max-w-4xl p-4 mb-6">
      <client-only>
        <template #fallback>
          <div class="w-full h-64 flex items-center justify-center text-gray-500">
            Lädt Karte...
          </div>
        </template>
        <SwitzerlandCantonsMap v-if="filteredRentData && areFiltersApplied" class="w-full h-full"
          :data="filteredRentData" />
      </client-only>
    </div>
  </div>
</template>


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