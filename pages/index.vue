<template>
  <div class="bg-white text-gray-800">
    <!-- Section 1: Hero -->
    <section class="h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 class="text-5xl font-bold mb-6">Wie leistbar ist Wohnen in der Schweiz?</h1>
      <p class="text-xl max-w-2xl">
        Datenbasiertes Storytelling rund um Mieten und Einkommen in der Schweiz – visualisiert und verständlich gemacht.
      </p>
    </section>

    <!-- Section 2: Choroplethen-Karte -->
    <section class="min-h-screen p-10 flex flex-col justify-center items-center">
      <h2 class="text-3xl font-semibold mb-4">Regionale Mietpreisunterschiede</h2>
      <div id="map" class="w-full max-w-4xl h-[500px] border border-gray-200"/>
    </section>

    <!-- Section 3: Einkommen -->
    <section class="min-h-screen p-10 flex flex-col justify-center items-center bg-gray-50">
      <h2 class="text-3xl font-semibold mb-4">Einkommen nach Berufsfeld</h2>
      <div id="income-bar" class="w-full max-w-4xl h-[400px] border border-gray-200"/>
    </section>

    <!-- Section 4: Verhältnis Miete/Einkommen -->
    <section class="min-h-screen p-10 flex flex-col justify-center items-center">
      <h2 class="text-3xl font-semibold mb-4">Wer zahlt wie viel?</h2>
      <div id="scatter-plot" class="w-full max-w-4xl h-[400px] border border-gray-200"/>
    </section>

    <!-- Section 5: Fazit -->
    <section class="min-h-screen flex flex-col justify-center items-center text-center p-10 bg-gray-100">
      <h2 class="text-3xl font-bold mb-4">Fazit</h2>
      <p class="text-xl max-w-2xl">
        Wohnen ist nicht für alle gleich leistbar. Einkommensunterschiede und regionale Preisunterschiede führen zu ungleichen Belastungen.
      </p>
    </section>
  </div>
</template>

<script setup>

import * as d3 from 'd3'

onMounted(() => {
  // Beispiel: Setup für Visualisierung später hier einbauen
})
</script>
