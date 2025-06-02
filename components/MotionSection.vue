<template>
  <section :class="sectionClass">
    <Motion
      :initial="{ opacity: 0, x: -100 }"
      :visible-once="{ opacity: 1, x: 0 }"
      :duration="500"
      :delay="200"
    >
      <slot />
    </Motion>
  </section>
</template>

<script setup lang="ts">

defineProps<{
  sectionClass?: string
}>()
</script>
