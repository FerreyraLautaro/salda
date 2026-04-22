<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Participant, Expense } from '../types'

const props = defineProps<{
  participant: Participant
  expenses: Expense[]
  allParticipants: Participant[]
}>()

const emit = defineEmits<{
  addExpense: [data: { amount: number; includedParticipantIds: string[]; description?: string }]
  removeExpense: [id: string]
  updateExpenseInclusions: [expenseId: string, includedParticipantIds: string[]]
  removeParticipant: []
  updateName: [name: string]
  updateAlias: [alias: string | null]
}>()

const expanded = ref(false)
const addingExpense = ref(false)
const showExclude = ref(false)

// Name inline edit
const editingName = ref(false)
const nameValue = ref(props.participant.name)
const nameInput = ref<HTMLInputElement | null>(null)

async function startEditName() {
  nameValue.value = props.participant.name
  editingName.value = true
  await nextTick()
  nameInput.value?.focus()
  nameInput.value?.select()
}

function saveName() {
  const v = nameValue.value.trim()
  if (v && v !== props.participant.name) emit('updateName', v)
  else nameValue.value = props.participant.name
  editingName.value = false
}

function cancelEditName() {
  nameValue.value = props.participant.name
  editingName.value = false
}

// Alias
const aliasValue = ref(props.participant.alias ?? '')
const aliasError = ref('')

const ALIAS_RE = /^[a-zA-Z0-9.\-]*$/

function validateAlias(v: string): string {
  if (!v) return ''
  if (/[ñÑ]/.test(v)) return 'No puede contener Ñ'
  if (/ /.test(v)) return 'No puede contener espacios'
  if (!ALIAS_RE.test(v)) return 'Solo letras, números, puntos y guiones'
  return ''
}

function saveAlias() {
  const v = aliasValue.value.trim()
  aliasError.value = validateAlias(v)
  if (aliasError.value) return
  const val = v || null
  if (val !== props.participant.alias) emit('updateAlias', val)
}

// Expense exclusion editing
const editingExclusionsFor = ref<string | null>(null)

function toggleExclusionOn(expenseId: string, participantId: string) {
  const exp = props.expenses.find(e => e.id === expenseId)
  if (!exp) return
  const included = new Set(exp.includedParticipantIds)
  included.has(participantId) ? included.delete(participantId) : included.add(participantId)
  if (included.size === 0) return
  emit('updateExpenseInclusions', expenseId, [...included])
}

// Expense draft
const draftAmount = ref<number | ''>('')
const draftDescription = ref('')
const draftExcluded = ref<Set<string>>(new Set())
const draftError = ref('')

const includedIds = computed(() =>
  props.allParticipants.filter(p => !draftExcluded.value.has(p.id)).map(p => p.id)
)

const splitPreview = computed(() => {
  if (!draftAmount.value || includedIds.value.length === 0) return null
  return (Number(draftAmount.value) / includedIds.value.length).toFixed(2)
})

function toggleExclude(id: string) {
  const s = new Set(draftExcluded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  draftExcluded.value = s
}

function openAdd() {
  if (addingExpense.value && draftAmount.value) {
    if (includedIds.value.length > 0) {
      emit('addExpense', {
        amount: Number(draftAmount.value),
        includedParticipantIds: includedIds.value,
        description: draftDescription.value.trim() || undefined,
      })
    }
  }
  addingExpense.value = true
  expanded.value = true
  draftAmount.value = ''
  draftDescription.value = ''
  draftExcluded.value = new Set()
  draftError.value = ''
  showExclude.value = false
}

function cancelAdd() {
  addingExpense.value = false
  draftError.value = ''
}

function submitAdd() {
  if (!draftAmount.value) { draftError.value = 'Ingresá un monto'; return }
  if (includedIds.value.length === 0) { draftError.value = 'Al menos un participante'; return }
  emit('addExpense', {
    amount: Number(draftAmount.value),
    includedParticipantIds: includedIds.value,
    description: draftDescription.value.trim() || undefined,
  })
  addingExpense.value = false
  draftAmount.value = ''
  draftDescription.value = ''
  draftExcluded.value = new Set()
}

function includedLabel(exp: Expense): string {
  if (exp.includedParticipantIds.length === props.allParticipants.length) return 'Todos'
  const excluded = props.allParticipants
    .filter(p => !exp.includedParticipantIds.includes(p.id))
    .map(p => p.name)
  return `Sin: ${excluded.join(', ')}`
}

const totalPaid = computed(() => props.expenses.reduce((s, e) => s + e.amount, 0))
</script>

<template>
  <div class="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden transition-colors">
    <!-- Header -->
    <div
      class="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <span class="text-zinc-400 dark:text-zinc-500 text-base transition-transform duration-200" :class="{ 'rotate-90': expanded || addingExpense }">›</span>

        <!-- Name: display or inline edit -->
        <div class="flex items-center gap-1 min-w-0" @click.stop>
          <template v-if="!editingName">
            <span class="font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ participant.name }}</span>
            <button
              class="w-5 h-5 flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors shrink-0"
              title="Editar nombre"
              @click="startEditName"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </template>
          <template v-else>
            <input
              ref="nameInput"
              v-model="nameValue"
              type="text"
              maxlength="60"
              class="px-2 py-0.5 text-sm font-medium rounded border border-blue-400 dark:border-blue-500 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none w-36"
              @blur="saveName"
              @keyup.enter="saveName"
              @keyup.escape="cancelEditName"
            />
          </template>
        </div>

        <span v-if="participant.alias" class="text-xs font-mono text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 shrink-0 max-w-[120px] truncate">
          {{ participant.alias }}
        </span>
        <span v-if="expenses.length > 0" class="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5 shrink-0">
          {{ expenses.length }} gasto{{ expenses.length !== 1 ? 's' : '' }} · ${{ totalPaid.toFixed(2) }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0" @click.stop>
        <button class="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-lg leading-none" title="Agregar gasto" @click="openAdd">+</button>
        <button class="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:border-red-300 dark:hover:border-red-700 hover:text-red-400 transition-colors text-xs" title="Quitar" @click="emit('removeParticipant')">✕</button>
      </div>
    </div>

    <!-- Body -->
    <div v-if="expanded || addingExpense" class="border-t border-zinc-100 dark:border-zinc-700 px-4 py-4 flex flex-col gap-4">

      <!-- Alias only -->
      <div class="flex flex-col gap-1">
        <label class="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">alias transferencia</label>
        <input
          v-model="aliasValue"
          type="text"
          placeholder="ej: juan.garcia"
          class="px-3 py-2 text-sm rounded-lg border bg-zinc-50 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-zinc-600 transition-colors font-mono"
          :class="aliasError
            ? 'border-red-300 dark:border-red-700 focus:border-red-400'
            : 'border-zinc-200 dark:border-zinc-700 focus:border-blue-400 dark:focus:border-blue-500'"
          @blur="saveAlias"
          @input="aliasError = ''"
          @keyup.enter="($event.target as HTMLInputElement).blur()"
        />
        <span v-if="aliasError" class="text-[10px] text-red-500 font-mono">{{ aliasError }}</span>
      </div>

      <!-- Expenses list -->
      <div v-if="expenses.length > 0" class="flex flex-col gap-2">
        <div
          v-for="exp in expenses"
          :key="exp.id"
          class="rounded-lg bg-zinc-50 dark:bg-zinc-700 border overflow-hidden transition-colors"
          :class="editingExclusionsFor === exp.id
            ? 'border-blue-200 dark:border-blue-700'
            : 'border-zinc-200 dark:border-zinc-700'"
        >
          <div class="flex items-center justify-between gap-3 px-3 py-2.5">
            <div class="flex items-center gap-2 flex-wrap min-w-0">
              <span class="font-semibold text-blue-600 dark:text-blue-400 tabular-nums text-sm">${{ exp.amount.toFixed(2) }}</span>
              <span v-if="exp.description" class="text-sm text-zinc-700 dark:text-zinc-300">{{ exp.description }}</span>
              <span class="text-xs text-zinc-400 dark:text-zinc-500">{{ includedLabel(exp) }}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                class="h-6 px-2 rounded text-[10px] font-mono border transition-colors"
                :class="editingExclusionsFor === exp.id
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-transparent'"
                @click="editingExclusionsFor = editingExclusionsFor === exp.id ? null : exp.id"
              >excluir</button>
              <button class="w-6 h-6 rounded flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs" @click="emit('removeExpense', exp.id)">✕</button>
            </div>
          </div>

          <!-- Inline exclusion picker -->
          <div v-if="editingExclusionsFor === exp.id" class="px-3 pb-3 flex flex-wrap gap-2 border-t border-blue-100 dark:border-blue-900/40 pt-2">
            <button
              v-for="p in allParticipants"
              :key="p.id"
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all"
              :class="exp.includedParticipantIds.includes(p.id)
                ? 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-red-300 dark:hover:border-red-600'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-400 line-through'"
              @click="toggleExclusionOn(exp.id, p.id)"
            >
              {{ p.name }}
              <span class="text-[9px]">{{ exp.includedParticipantIds.includes(p.id) ? '✓' : '✕' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add expense form -->
      <div v-if="addingExpense" class="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 p-4 flex flex-col gap-4">
        <div class="flex gap-3 flex-wrap">
          <div class="flex flex-col gap-1">
            <label class="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">monto</label>
            <input
              v-model="draftAmount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              autofocus
              class="w-28 px-3 py-2 text-base font-mono rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-300 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
              @keyup.enter="submitAdd"
              @keyup.escape="cancelAdd"
            />
          </div>
          <div class="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label class="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">descripción (opcional)</label>
            <input
              v-model="draftDescription"
              type="text"
              placeholder="ej: Carne y chorizos"
              maxlength="200"
              class="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
              @keyup.enter="submitAdd"
              @keyup.escape="cancelAdd"
            />
          </div>
        </div>

        <!-- Exclude -->
        <div class="flex flex-col gap-2">
          <button type="button" class="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-mono" @click="showExclude = !showExclude">
            <span>{{ showExclude ? '▴' : '▾' }} Excluir participantes</span>
            <span v-if="draftExcluded.size > 0" class="text-blue-500 dark:text-blue-400">({{ draftExcluded.size }} excluido{{ draftExcluded.size !== 1 ? 's' : '' }})</span>
          </button>
          <div v-if="showExclude" class="flex flex-wrap gap-2">
            <button
              v-for="p in allParticipants"
              :key="p.id"
              type="button"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all"
              :class="[
                p.id === participant.id
                  ? 'opacity-40 cursor-not-allowed border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500'
                  : draftExcluded.has(p.id)
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-400 line-through'
                    : 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-600'
              ]"
              :disabled="p.id === participant.id"
              @click="toggleExclude(p.id)"
            >
              {{ p.name }}
              <span class="text-[9px]">{{ draftExcluded.has(p.id) ? '✕' : '✓' }}</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span v-if="splitPreview" class="text-sm font-mono">
              <span class="font-bold text-blue-600 dark:text-blue-400">${{ splitPreview }}</span>
              <span class="text-zinc-400 dark:text-zinc-500"> c/u × {{ includedIds.length }} pers.</span>
            </span>
            <span v-if="draftError" class="text-xs text-red-500 font-mono">{{ draftError }}</span>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" type="button" @click="cancelAdd">Cancelar</button>
            <button
              class="px-4 py-1.5 text-xs rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 transition-colors font-medium"
              type="button"
              :disabled="!draftAmount"
              @click="submitAdd"
            >✓ Guardar</button>
          </div>
        </div>
      </div>

      <!-- Empty hint -->
      <div v-if="!addingExpense && expenses.length === 0" class="text-center py-1">
        <button class="text-xs text-zinc-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" @click="openAdd">+ Agregar primer gasto</button>
      </div>
    </div>
  </div>
</template>
