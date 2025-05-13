<template>
  <footer class="w-full bg-gray-50 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600 text-sm">
      <div>
        <h2 class="font-semibold text-gray-900 mb-2">Über das Projekt</h2>
        <p>
          Diese Website wurde im Rahmen des FHNW-Moduls «Interaktive Visualisierungen» erstellt.
          Ziel ist es, die Wohnsituation in der Schweiz datengestützt zu erzählen.
        </p>
      </div>

      <div>
        <h2 class="font-semibold text-gray-900 mb-2">Navigation</h2>
        <ul class="space-y-1">
          <li><a href="#map" class="hover:text-black">Mietpreise</a></li>
          <li><a href="#income-bar" class="hover:text-black">Einkommen</a></li>
          <li><a href="#scatter-plot" class="hover:text-black">Verhältnis</a></li>
          <li><a href="#fazit" class="hover:text-black">Fazit</a></li>
        </ul>
      </div>

      <div>
        <p class="mt-2 text-xs text-gray-400">© {{ new Date().getFullYear() }} FHNW Datenstorytelling</p>
      </div>
    </div>
  </footer>
</template>
