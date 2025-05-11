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
  <section class="min-h-screen p-10 flex flex-col justify-center items-center">
    <h2 class="text-3xl font-semibold mb-4">Mietpreise nach Kanton</h2>
    <div id="map" class="w-full max-w-4xl h-auto border border-gray-200 p-4">
      <div class="mb-6 grid grid-cols-3 gap-4">
        <!-- Anzahl an Räumen -->
        <div>
          <label class="font-medium">Anzahl an Zimmern</label>
          <div v-for="item in uniqueRoomOptions" :key="item">
            <label>
              <input
                type="radio"
                name="gender"
                :value="item"
                v-model="selectedRoomOption"
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
          v-if="filteredRentData && areFiltersApplied"
          class="w-full h-full"
          :data="filteredRentData"
        />
      </client-only>
    </div>
  </section>
</template>
