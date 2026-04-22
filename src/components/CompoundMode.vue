<script setup lang="ts">
import { ref } from 'vue'
import { useCompound } from '../composables/useCompound'
import ParticipantCard from './ParticipantCard.vue'
import TransferResult from './TransferResult.vue'

const { participants, transfers, addParticipant, removeParticipant, updateParticipant, addExpense, removeExpense, updateExpenseInclusions, expensesOf, reset } = useCompound()

const newName = ref('')
const nameError = ref('')

function add() {
  const name = newName.value.trim()
  if (!name) { nameError.value = 'Ingresá un nombre'; return }
  if (participants.value.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    nameError.value = 'Ya existe ese nombre'
    return
  }
  addParticipant(name)
  newName.value = ''
  nameError.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- Add participant -->
    <div class="flex gap-2">
      <div class="flex-1 relative">
        <input
          v-model="newName"
          type="text"
          placeholder="Nombre del participante"
          maxlength="60"
          class="w-full px-4 py-2.5 rounded-xl border text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
          :class="nameError
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30'
            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'"
          @keyup.enter="add"
          @input="nameError = ''"
        />
        <span v-if="nameError" class="absolute -bottom-4 left-1 text-xs text-red-500 font-mono">{{ nameError }}</span>
      </div>
      <button
        class="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shrink-0"
        @click="add"
      >
        + Agregar
      </button>
    </div>

    <!-- Participant cards -->
    <div v-if="participants.length > 0" class="flex flex-col gap-3 mt-2">
      <ParticipantCard
        v-for="p in participants"
        :key="p.id"
        :participant="p"
        :expenses="expensesOf(p.id)"
        :all-participants="participants"
        @add-expense="d => addExpense(p.id, d.amount, d.includedParticipantIds, d.description)"
        @remove-expense="id => removeExpense(id)"
        @update-expense-inclusions="(id, ids) => updateExpenseInclusions(id, ids)"
        @remove-participant="removeParticipant(p.id)"
        @update-name="name => updateParticipant(p.id, { name })"
        @update-alias="alias => updateParticipant(p.id, { alias })"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 px-6 py-10 text-center">
      <p class="text-sm text-zinc-400 dark:text-zinc-500">Agregá participantes para empezar</p>
    </div>

    <!-- Result -->
    <TransferResult v-if="transfers.length > 0" :transfers="transfers" />

    <!-- Reset -->
    <div v-if="participants.length > 0" class="flex justify-end pt-1">
      <button class="text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-400 dark:hover:text-red-400 transition-colors" @click="reset">Limpiar todo</button>
    </div>
  </div>
</template>
