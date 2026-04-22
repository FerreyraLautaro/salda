<script setup lang="ts">
import { ref, computed } from 'vue'

const total = ref<number | ''>('')
const people = ref<number | ''>(2)

const perPerson = computed(() => {
  if (!total.value || !people.value || Number(people.value) < 1) return null
  return Number(total.value) / Number(people.value)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <label class="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">Monto total</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 font-mono text-sm">$</span>
          <input
            v-model="total"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            class="w-full pl-7 pr-3 py-3 text-lg font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">Personas</label>
        <input
          v-model="people"
          type="number"
          placeholder="2"
          min="1"
          step="1"
          class="w-full px-3 py-3 text-lg font-mono rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
        />
      </div>
    </div>

    <div v-if="perPerson !== null" class="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 px-6 py-5 text-center">
      <p class="text-xs uppercase tracking-widest text-blue-400 dark:text-blue-500 font-mono mb-1">Cada uno paga</p>
      <p class="text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">${{ perPerson.toFixed(2) }}</p>
      <p class="text-xs text-blue-400 dark:text-blue-500 mt-1.5 font-mono">${{ Number(total).toFixed(2) }} ÷ {{ people }} personas</p>
    </div>

    <div v-else class="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 px-6 py-8 text-center">
      <p class="text-sm text-zinc-400 dark:text-zinc-500">Ingresá el monto y la cantidad de personas</p>
    </div>
  </div>
</template>
