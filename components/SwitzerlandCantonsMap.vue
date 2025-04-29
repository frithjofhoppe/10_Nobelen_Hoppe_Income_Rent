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

const cantonRentPrices = {
  "Aargau": 2244.0,
  "Appenzell A.Rh.": 2044.0,
  "Genf": 1996.0,
  "Graubünden": 1815.0,
  "Jura": 1391.0,
  "Luzern": 2383.0,
  "Neuenburg": 1995.0,
  "Nidwalden": 2235.0,
  "Obwalden": 2225.0,
  "Schaffhausen": 2168.0,
  "Schwyz": 2801.0,
  "Solothurn": 2051.0,
  "St.Gallen": 1996.0,
  "Tessin": 2127.0,
  "Thurgau": 2153.0,
  "Uri": 1372.0,
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
    .scale(10000)
    .translate([width / 2, height / 2])

  const path = d3.geoPath().projection(projection)

  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([1000, 3000])

  // Create the tooltip once at the start
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', '#fff')
    .style('border', '1px solid #ccc')
    .style('padding', '10px')
    .style('border-radius', '4px')
    .style('box-shadow', '0 2px 4px rgba(0, 0, 0, 0.2)')
    .style('pointer-events', 'none')
    .style('opacity', 0)

  svg.selectAll('path')
    .data(geoData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', (d) => {
      const cantonName = d.properties.name
      const avgRentPrice = cantonRentPrices[cantonName]
      return avgRentPrice ? colorScale(avgRentPrice) : '#ccc' // Use #ccc for missing data
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5)
    .on('mouseover', function (event, d) {
      const cantonName = d.properties.name
      const avgRentPrice = cantonRentPrices[cantonName]
      d3.select(this)
        .attr('fill', '#f00')

      tooltip
        .html(`<strong>${cantonName}</strong><br>Avg Rent: ${avgRentPrice ? avgRentPrice.toLocaleString('en-US', { style: 'currency', currency: 'CHF' }) : 'No Data'}`)

      const tooltipWidth = tooltip.node().offsetWidth
      const tooltipHeight = tooltip.node().offsetHeight

      const left = event.pageX + 10
      const top = event.pageY + 10

      // Prevent tooltip from going out of the screen
      const adjustedLeft = left + tooltipWidth > window.innerWidth ? left - tooltipWidth - 20 : left
      const adjustedTop = top + tooltipHeight > window.innerHeight ? top - tooltipHeight - 20 : top

      tooltip
        .style('left', `${adjustedLeft}px`)
        .style('top', `${adjustedTop}px`)
        .style('opacity', 1)
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', (d) => {
        const cantonName = d.properties.name
        const avgRentPrice = cantonRentPrices[cantonName]
        return avgRentPrice ? colorScale(avgRentPrice) : '#ccc'
      })
      tooltip.style('opacity', 0)
    })

  // Optional: Add a legend for the color scale
  const legend = svg.append('g')
    .attr('transform', 'translate(20, 20)')

  const legendScale = d3.scaleLinear()
    .domain([1000, 3000])
    .range([0, 200])

  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d3.format('$,.0f'))

  legend.append('g')
    .attr('transform', 'translate(0, 20)')
    .call(legendAxis)

  legend.append('rect')
    .attr('width', 200)
    .attr('height', 20)
    .style('fill', 'url(#gradient)')

  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'gradient')
    .attr('x1', '0%')
    .attr('x2', '100%')
    .attr('y1', '0%')
    .attr('y2', '0%')

  gradient.append('stop')
    .attr('offset', '0%')
    .style('stop-color', colorScale(1000))

  gradient.append('stop')
    .attr('offset', '100%')
    .style('stop-color', colorScale(3000))
})
</script>

<style scoped>
svg {
  max-width: 100%;
  height: auto;
}

.tooltip {
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.2s ease;
}
</style>
