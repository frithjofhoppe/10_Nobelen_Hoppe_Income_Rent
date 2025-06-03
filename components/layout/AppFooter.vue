<template>
  <footer class="w-full bg-gray-50 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600 text-sm">
      <div>
        <h2 class="font-semibold text-gray-900 mb-2">About this project</h2>
        <p>
          This website was created as part of the FHNW module “Interactive Visualizations.”
          The aim is to provide a data-driven account of the housing situation in Switzerland.
        </p>
      </div>

      <div>
        <h2 class="font-semibold text-gray-900 mb-2">Navigation</h2>
        <ul class="space-y-1">
          <li><a href="#map" class="hover:text-black">Rent prices</a></li>
          <li><a href="#income-bar" class="hover:text-black">Income</a></li>
          <li><a href="#scatter-plot" class="hover:text-black">Comparison</a></li>
          <li><a href="#fazit" class="hover:text-black">Conclusion</a></li>
        </ul>
      </div>

      <div>
        <p class="mt-2 text-xs text-gray-400">© {{ new Date().getFullYear() }} FHNW Datastorytelling</p>
      </div>
    </div>
  </footer>
</template>
