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

// Dummy data for coloring based on population density or some other metric
const cantonData = {
  "Zurich": { populationDensity: 500 },
  "Geneva": { populationDensity: 300 },
  "Bern": { populationDensity: 200 },
  // Add more cantons and their data here
}

onMounted(async () => {
  const width = 800
  const height = 600

  // Load TopoJSON data
  const res = await fetch('https://unpkg.com/swiss-maps@4/2021/ch-combined.json')
  const topoData = await res.json()

  // Extract GeoJSON for cantons
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
    .attr('fill', d => {
      // Color based on population density or other variable
      const cantonName = d.properties.name || d.properties.NAME
      const data = cantonData[cantonName]
      return data ? getColorForDensity(data.populationDensity) : '#cccccc'
    })
    .attr('stroke', '#333333')
    .on('mouseover', function (event, d) {
      const cantonName = d.properties.name || d.properties.NAME
      const data = cantonData[cantonName]
      const info = data ? `Population Density: ${data.populationDensity} people/km²` : 'No data available'

      d3.select(this).attr('fill', 'orange')

      // Tooltip or popup info
      showPopup(event, cantonName, info)
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', (d) => {
        const cantonName = d.properties.name || d.properties.NAME
        const data = cantonData[cantonName]
        return data ? getColorForDensity(data.populationDensity) : '#cccccc'
      })
      hidePopup()
    })
    .append('title')
    .text(d => d.properties.name || d.properties.NAME)
})

function getColorForDensity(density) {
  if (density > 400) return '#ff0000' // High density: Red
  if (density > 200) return '#ff9900' // Medium density: Orange
  return '#cccccc' // Low density: Light grey
}

function showPopup(event, cantonName, info) {
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border', '1px solid #ccc')
    .style('box-shadow', '0 0 5px rgba(0, 0, 0, 0.1)')
    .html(`<strong>${cantonName}</strong><br>${info}`)
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY + 10}px`)
}

function hidePopup() {
  d3.selectAll('.tooltip').remove()
}
</script>

<style scoped>
svg {
  max-width: 100%;
  height: auto;
}

.tooltip {
  pointer-events: none;
  z-index: 10;
}
</style>
