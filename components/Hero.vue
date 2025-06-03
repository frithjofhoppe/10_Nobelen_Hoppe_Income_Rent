<template>
  <MotionSection>
    <section class="h-[calc(100vh-84px)] bg-gray-50 flex flex-col items-center justify-center text-center p-8">
      <div class="h-1/2 mt-auto mb-10">
        <client-only>
          <component :is="Vue3Lottie" :animation-data="animationData" />
        </client-only>
      </div>
      <h1 class="text-5xl font-bold mb-8">
        How affordable is housing in Switzerland?
      </h1>
      <p class="text-xl max-w-2xl mb-10">
        Data-driven storytelling about rents and incomes in Switzerland –
        visualized and made understandable.
      </p>
      <button
        class="bg-white rounded-full p-3 shadow-md hover:shadow-lg cursor-pointer transition duration-300 flex items-center justify-center group"
        aria-label="Scroll to income section"
        @click="scrollToIncome"
      >
        <svg
          class="w-6 h-6 text-black transition-transform duration-300 group-hover:translate-y-1"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  </MotionSection>
  </template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import animationData from "@/assets/animations/house.json";
import { useRouter } from "vue-router";

const router = useRouter();

const Vue3Lottie = ref();

onMounted(async () => {
  const mod = await import("vue3-lottie");
  Vue3Lottie.value = mod.Vue3Lottie;
});

function scrollToIncome() {
  router.push({ hash: "#rent-canton" });
}
</script>
