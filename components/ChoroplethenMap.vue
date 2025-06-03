<template>
  <div class="min-h-screen p-10 flex flex-col justify-center items-center mx-auto max-w-4xl gap-5">
    <MotionSection>
      <h2 id="rent-canton" class="text-4xl font-semibold mb-8">Rent prices per canton</h2>
    </MotionSection>
    <MotionSection>
      <div class="space-y-4">
        <p>
          Welcome to your journey through the Swiss rental market. Our first chart shows you at a glance: apartment
          prices are everything – except fairly distributed.
        </p>
        <p>
          Try out different cantons and room sizes. You will quickly notice that prices do not rise linearly, but in
          leaps and bounds. A three-room apartment in Zurich costs an average of CHF 1,681, while in Neuchâtel it costs
          only CHF 1,010. Particularly striking: six-room apartments in the canton of Zug cost an average of CHF 3,391.
          That is almost three times as much as in the canton of Jura (CHF 1,391).
        </p>
        <p>
          👉 Tip: Pay attention to the jump between 3 and 4 rooms – rents are skyrocketing in many cantons in this
          range.
        </p>
      </div>
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