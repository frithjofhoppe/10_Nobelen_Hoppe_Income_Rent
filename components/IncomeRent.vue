<template>
  <div class="min-h-screen p-10 flex flex-col justify-center items-center mx-auto max-w-4xl">
    <MotionSection>
      <h2 id="income-rent" class="text-4xl font-semibold mb-8">Comparison of rent prices and incomes</h2>
    </MotionSection>
    <MotionSection>
      <div class="space-y-4">
        <p>
          Now let's get specific: The third chart links income and rent – and asks the question: How much of your income
          really goes toward housing? The rule of thumb is that a maximum of 30% of your net income should be spent on
          rent. But in reality, this limit is often exceeded – sometimes significantly.

        </p>
        <p>
          An example from Zurich: The average gross salary for a person with vocational training who is not a manager is
          CHF 6,289. At 80%, the net salary is around CHF 5,031. The average rent for a three-room apartment is CHF
          1,681 – that is around 33.4% of net income.
        </p>
        <p>
          The situation is even more pronounced in Ticino: with a gross salary of CHF 5,482 (vocational training, no
          management position), the net salary is CHF 4,386. The rent for a three-room apartment is CHF 1,241 – that's
          28.3%. Sounds better? Yes – but only just below the breaking point, with no leeway for rising ancillary costs.
        </p>
        <p>
          The situation is critical for single parents or part-time workers in expensive regions: anyone earning less
          than CHF 4,500 net and paying more than CHF 1,300 in rent quickly reaches the 35% mark.
        </p>
        <p>
          👉 The graph shows that, depending on the region and job profile, the 30% rule is often nothing more than an ideal. Click through—what does it look like for you?
        </p>
      </div>

      <MotionSection id="map" section-class="w-full max-w-4xl h-auto p-4">
        <div class="mb-7 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[180px]">
            <label class="font-medium">Number of rooms</label>
            <select v-model="selectedRoomOption" class="border border-gray-300 rounded p-2 w-full">
              <option v-for="item in uniqueRoomOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <!-- Professional position -->
          <div class="flex-1 min-w-[180px]">
            <label class="font-medium">Professional position</label>
            <select v-model="selectedPosition" class="border border-gray-300 rounded p-2 w-full">
              <option v-for="item in uniquePositions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <!-- Gender -->
          <div class="flex-1 min-w-[180px]">
            <label class="font-medium">Gender</label>
            <select v-model="selectedGender" class="border border-gray-300 rounded p-2 w-full">
              <option v-for="item in uniqueGenders" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>

          <!-- Canton -->
          <div class="flex-1 min-w-[180px]">
            <label class="font-medium">Canton</label>
            <select v-model="selectCanton" class="border border-gray-300 rounded p-2 w-full">
              <option v-for="item in cantons" :key="item.cantonCode" :value="item.cantonCode">
                {{ item.cantonCode }}
              </option>
            </select>
          </div>
        </div>
      </MotionSection>

      <svg ref="chart" width="800" height="500" />
    </MotionSection>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as d3 from 'd3';
import { GeographicRegion, useIncomeData, useRegionCantonMapping, useRentPriceData } from '@/composable/data'

const { data } = useIncomeData()
const rentData = useRentPriceData()
const regionCantonMapping = useRegionCantonMapping()

const chart = ref(null);

const cantons = computed(() => {
  return regionCantonMapping
    .map(x => x)
    .sort((a, b) => a.cantonCode.localeCompare(b.cantonCode));
})
const uniqueRoomOptions = computed(() => [...new Set(rentData.flatMap(entry => entry.prices.map(price => price.nofRooms)))]);
const uniquePositions = computed(() => data.value?.professionalPositions ?? []);
const uniqueGenders = computed(() => data.value?.genders ?? []);
const uniqueEducations = computed(() => data.value?.educations ?? []);

const selectedRoomOption = ref<string | null>(uniqueRoomOptions.value[0] || null);
const selectedPosition = ref<string | null>(uniquePositions.value[0] || null);
const selectedGender = ref<string | null>(uniqueGenders.value[0] || null);
const selectCanton = ref<string | null>(cantons.value[0]?.cantonCode || null);


const areFiltersApplied = computed(() => {
  return !!(selectedRoomOption.value && selectedPosition.value && selectedGender.value && selectCanton.value)
})

const filteredData = computed(() => {
  const regionName = regionCantonMapping.find(x => x.cantonCode === selectCanton.value)?.regionName
  const income = data.value?.entries.filter(entry => {
    const matchPosition = !selectedPosition.value || entry.professionalPosition === selectedPosition.value
    const matchGender = !selectedGender.value || entry.gender === selectedGender.value
    const matchRegion = !regionName || entry.region === regionName
    return matchPosition && matchGender && matchRegion
  })
  const rent = rentData.find(x => x.cantonCode === selectCanton.value)?.prices.find(x => x.nofRooms === selectedRoomOption.value)?.avgPrice

  if (income) {
    // Converts income into LineBarEntry
    return uniqueEducations.value.map(education => {
      const entry = income.find(x => x.education === education)
      if (entry) {
        return {
          education: entry.education,
          // Only use 80% because the value is the brutto income not netto
          nettoIncome: entry.value.centralValue != 'NaN' ? Number(entry.value.centralValue) * 0.8 : 0,
          rent: rent ? Number(rent) : 0,
        } as LineBarEntry
      }
    }).filter(d => d && d?.nettoIncome)
      .map(d => ({
        ...d,
        // 30% rule of thumb for rent
        threshold: d.nettoIncome * 0.3
      })).filter(d => d !== undefined)
  }

  return []
})

interface LineBarEntry {
  education: string,
  nettoIncome: number,
  rent: number,
  threshold: number
}


function renderBarChart(data: LineBarEntry[]) {
  d3.select(chart.value).selectAll('*').remove() // Clear previous content

  const margin = { top: 40, right: 20, bottom: 70, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select(chart.value)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand()
    .domain(data.map(d => d.education))
    .range([0, width])
    .paddingInner(0.2);

  const x1 = d3.scaleBand()
    .domain(['Netto Income', 'Rent'])
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.nettoIncome, d.rent)) * 1.2])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => `${d} CHF`));


  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end")
    .text(function (d) {
      // Truncate long labels
      return d.length > 15 ? d.slice(0, 15) + "..." : d;
    });

  svg.append("g")
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", d => `translate(${x0(d.education)},0)`)
    .selectAll("rect")
    .data(d => [
      { key: "Netto Income", value: d.nettoIncome },
      { key: "Rent", value: d.rent }
    ])
    .join("rect")
    .attr("x", d => x1(d.key))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", d => d.key === "Netto Income" ? "#4daf4a" : "#e41a1c");

  data.forEach(d => {
    svg.append("line")
      .attr("x1", x0(d.education))
      .attr("x2", x0(d.education) + x0.bandwidth())
      .attr("y1", y(d.threshold))
      .attr("y2", y(d.threshold))
      .attr("stroke", "#377eb8")
      .attr("stroke-dasharray", "4 2")
      .attr("stroke-width", 2);
  });

  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, 0)`);

  const legendData = [
    { label: "Net Income", color: "#4daf4a" },
    { label: "Rent", color: "#e41a1c" },
    { label: "30% rule of thumb", color: "#377eb8", type: "line" }
  ];

  legend.selectAll("*")
    .data(legendData)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
    .each(function (d) {
      const g = d3.select(this);
      if (d.type === "line") {
        g.append("line")
          .attr("x1", 0)
          .attr("x2", 18)
          .attr("y1", 9)
          .attr("y2", 9)
          .attr("stroke", d.color)
          .attr("stroke-dasharray", "4 2")
          .attr("stroke-width", 2);
      } else {
        g.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", d.color);
      }
      g.append("text")
        .attr("x", 24)
        .attr("y", 13)
        .text(d.label)
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });
}

watchEffect(() => {
  // Ensure default selections are applied if not already set
  if (!selectedRoomOption.value && uniqueRoomOptions.value.length > 0) {
    selectedRoomOption.value = uniqueRoomOptions.value[0];
  }
  if (!selectedPosition.value && uniquePositions.value.length > 0) {
    selectedPosition.value = uniquePositions.value[0];
  }
  if (!selectedGender.value && uniqueGenders.value.length > 0) {
    selectedGender.value = uniqueGenders.value[0];
  }
  if (!selectCanton.value && regionCantonMapping.length > 0) {
    selectCanton.value = regionCantonMapping[0].cantonCode;
  }

  if (areFiltersApplied.value) {
    renderBarChart(filteredData.value);
  }
});

</script>

<style scoped>
svg {
  font-family: sans-serif;
}
</style>