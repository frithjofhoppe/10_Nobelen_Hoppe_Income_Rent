<template>
  <div>
    <h2 class="text-3xl font-semibold mb-4">Kantone der Schweiz</h2>
    <svg ref="svgRef" class="w-full h-auto" />
  </div>
</template>

<script setup>
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { ref } from 'vue'
import { useRegionCantonMapping } from '@/composable/data'


const mapping = useRegionCantonMapping()
const svgRef = ref()
const props = defineProps({
  data : {
    type: Object,
    required: true
  }
})

const graphicIdMapping = {
      1: 'ZH',
      2: 'BE',
      3: 'LU',
      4: 'UR',
      5: 'SZ',
      6: 'OW',
      7: 'NW',
      8: 'GL',
      9: 'ZG',
      10: 'FR',
      11: 'SO',
      12: 'BS',
      13: 'BL',
      14: 'SH',
      15: 'AR',
      16: 'AI',
      17: 'SG',
      18: 'GR',
      19: 'AG',
      20: 'TG',
      21: 'TI',
      22: 'VD',
      23: 'VS',
      24: 'NE',
      25: 'GE',
      26: 'JU',
}

function getCenterValueForId(data, id) {
  const cantonEntry = mapping.find(x => x.cantonCode == graphicIdMapping[id])
  return data.find(entry => entry.region === cantonEntry.regionName).value.centralValue
}

async function renderMap(data) {
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
  const minValue = d3.min(data, d => d.value.centralValue)  
  const maxValue = d3.max(data, d => d.value.centralValue)  

  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([minValue, maxValue])

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
      const avgRentPrice = getCenterValueForId(data, d.id)
      return avgRentPrice ? colorScale(avgRentPrice) : '#ccc' // Use #ccc for missing data
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5)
    .on('mouseover', function (event, d) {
      d3.select(this)
        .attr('fill', '#f00')

      const cantonEntry = mapping.find(x => x.cantonCode == graphicIdMapping[d.id])

      const entry = data.find(entry => entry.region === cantonEntry.regionName)
      tooltip
        .html(`
          <strong>${cantonEntry.cantonName}</strong>
          <ul>
            <li>p10 ${entry.value.p10}</li>
            <li>p25 ${entry.value.p25}</li>
            <li>p75 ${entry.value.p75}</li>
            <li>centralValue ${entry.value.centralValue}</li>
          </ul>
        `)

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
        const avgRentPrice = getCenterValueForId(data, d.id)
        return avgRentPrice ? colorScale(avgRentPrice) : '#ccc'
      })
      tooltip.style('opacity', 0)
    })

  // Optional: Add a legend for the color scale
  const legend = svg.append('g')
    .attr('transform', 'translate(20, 20)')

  const legendScale = d3.scaleLinear()
    .domain([minValue, maxValue])
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
    .style('stop-color', colorScale(minValue))

  gradient.append('stop')
    .attr('offset', '100%')
    .style('stop-color', colorScale(maxValue))
}


watch(() => props.data, async (newData) => {
  if (newData) {
    await renderMap(      newData
    .filter(entry => entry.professionalPosition === 'Ohne Kaderfunktion')
    .filter(entry => entry.gender === 'Frauen')
    .filter(entry => entry.education === 'Lehrpatent')
    )
  }
}, { immediate: true })

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
