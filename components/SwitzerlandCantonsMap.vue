<template>
  <div>
    <h2 class="text-3xl font-semibold mb-4">Kantone der Schweiz</h2>
    <svg ref="svgRef" class="w-full h-auto" />
  </div>
</template>

<script setup>
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { onMounted, ref } from 'vue'

const svgRef = ref()

onMounted(async () => {
  const width = 800
  const height = 600

  // Lade TopoJSON
  const res = await fetch('https://unpkg.com/swiss-maps@4/2021/ch-combined.json')
  const topoData = await res.json()

  // Extrahiere Kantone als GeoJSON
  const geoData = topojson.feature(topoData, topoData.objects.cantons)

  if (!geoData || !geoData.features) {
    console.error('GeoJSON data is invalid or missing `features`', geoData)
    return
  }

  const svg = d3.select(svgRef.value)
    .attr('viewBox', [0, 0, width, height])

  const projection = d3.geoMercator()
    .center([8.3, 46.8])
    .scale(9000)
    .translate([width / 2, height / 2])

  const path = d3.geoPath().projection(projection)

  svg.selectAll('path')
    .data(geoData.features)
    .join('path')
    .attr('d', path)
    .attr('fill', '#cccccc')
    .attr('stroke', '#333333')
    .on('mouseover', function () {
      d3.select(this).attr('fill', 'orange')
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', '#cccccc')
    })
    .append('title')
    .text(d => d.properties.name || d.properties.NAME)
})
</script>

<style scoped>
svg {
  max-width: 100%;
  height: auto;
}
</style>
