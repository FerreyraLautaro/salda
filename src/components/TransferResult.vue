<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Transfer } from '../types'

const props = defineProps<{ transfers: Transfer[] }>()

const donationAlias = import.meta.env.VITE_DONATION_ALIAS as string | undefined
const cafesitoUrl = import.meta.env.VITE_CAFECITO_URL as string | undefined

const copied = ref(false)

const text = computed(() => {
  const lines = props.transfers.map(t => {
    const alias = t.toAlias ? ` (alias: ${t.toAlias})` : ''
    return `${t.fromName} le paga a ${t.toName}${alias}: $${t.amount.toFixed(2)}`
  })
  const body = `💸 Salda — Resultado:\n${lines.join('\n')}`
  if (!donationAlias) return body
  return `${body}\n\n🙌 Espero les haya ayudado, les dejo mi alias por si desean aportar: ${donationAlias}`
})

async function copy() {
  await navigator.clipboard.writeText(text.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function shareWhatsApp() {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text.value)}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="mt-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 border-t-2 border-t-emerald-400 dark:border-t-emerald-500 bg-white dark:bg-zinc-800 shadow-md overflow-hidden transition-colors">
    <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
      <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Resultado</span>
      <div class="flex gap-2">
        <button
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          @click="copy"
        >
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ copied ? 'Copiado' : 'Copiar' }}
        </button>
        <button
          class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors font-medium"
          @click="shareWhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          WhatsApp
        </button>
      </div>
    </div>

    <ul class="divide-y divide-zinc-100 dark:divide-zinc-700">
      <li v-for="t in transfers" :key="`${t.fromId}-${t.toId}`" class="px-5 py-3.5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 min-w-0">
          <span class="font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ t.fromName }}</span>
          <span class="text-zinc-400 dark:text-zinc-500 text-sm shrink-0">→</span>
          <div class="min-w-0">
            <span class="font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ t.toName }}</span>
            <span v-if="t.toAlias" class="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-mono">{{ t.toAlias }}</span>
          </div>
        </div>
        <span class="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 tabular-nums">${{ t.amount.toFixed(2) }}</span>
      </li>
    </ul>

    <!-- Cafecito -->
    <div class="px-5 py-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between gap-3">
      <span class="text-xs text-zinc-400 dark:text-zinc-500">¿Te fue útil? Invitame un cafecito ☕</span>
      <a
        :href="cafesitoUrl || '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium transition-colors shrink-0"
      >
        ☕ Cafecito
      </a>
    </div>
  </div>
</template>
