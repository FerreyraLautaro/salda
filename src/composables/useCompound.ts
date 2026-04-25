import { ref, computed, watch } from 'vue'
import type { Participant, Expense, Transfer } from '../types'

function uid() {
  return crypto.randomUUID()
}

const STORAGE_KEY = 'salda:compound'
const TTL_MS = 3 * 60 * 60 * 1000 // 3 hours

interface PersistedState {
  participants: Participant[]
  expenses: Expense[]
  savedAt: number
}

function loadFromStorage(): { participants: Participant[]; expenses: Expense[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { participants: [], expenses: [] }
    const data: PersistedState = JSON.parse(raw)
    if (Date.now() - data.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return { participants: [], expenses: [] }
    }
    return { participants: data.participants, expenses: data.expenses }
  } catch {
    return { participants: [], expenses: [] }
  }
}

function saveToStorage(participants: Participant[], expenses: Expense[]) {
  const data: PersistedState = { participants, expenses, savedAt: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useCompound() {
  const initial = loadFromStorage()
  const participants = ref<Participant[]>(initial.participants)
  const expenses = ref<Expense[]>(initial.expenses)

  watch([participants, expenses], ([p, e]) => saveToStorage(p, e), { deep: true })

  function addParticipant(name: string) {
    const p = { id: uid(), name: name.trim(), alias: null }
    participants.value.push(p)
    // Include new participant in all existing expenses
    for (const exp of expenses.value) {
      if (!exp.includedParticipantIds.includes(p.id)) {
        exp.includedParticipantIds.push(p.id)
      }
    }
  }

  function removeParticipant(id: string) {
    participants.value = participants.value.filter(p => p.id !== id)
    expenses.value = expenses.value.filter(e => e.paidById !== id)
    for (const exp of expenses.value) {
      exp.includedParticipantIds = exp.includedParticipantIds.filter(pid => pid !== id)
    }
    expenses.value = expenses.value.filter(e => e.includedParticipantIds.length > 0)
  }

  function updateParticipant(id: string, patch: Partial<Pick<Participant, 'name' | 'alias'>>) {
    const p = participants.value.find(p => p.id === id)
    if (p) Object.assign(p, patch)
  }

  function addExpense(paidById: string, amount: number, includedParticipantIds: string[], description?: string) {
    expenses.value.push({
      id: uid(),
      paidById,
      amount,
      description: description ?? null,
      includedParticipantIds,
    })
  }

  function removeExpense(id: string) {
    expenses.value = expenses.value.filter(e => e.id !== id)
  }

  function updateExpenseInclusions(expenseId: string, includedParticipantIds: string[]) {
    const exp = expenses.value.find(e => e.id === expenseId)
    if (exp) exp.includedParticipantIds = includedParticipantIds
  }

  function expensesOf(participantId: string) {
    return expenses.value.filter(e => e.paidById === participantId)
  }

  const transfers = computed<Transfer[]>(() => {
    if (participants.value.length < 2 || expenses.value.length === 0) return []

    const balances = new Map<string, number>()
    for (const p of participants.value) balances.set(p.id, 0)

    for (const exp of expenses.value) {
      if (exp.includedParticipantIds.length === 0) continue
      const share = exp.amount / exp.includedParticipantIds.length
      balances.set(exp.paidById, (balances.get(exp.paidById) ?? 0) + exp.amount)
      for (const pid of exp.includedParticipantIds) {
        balances.set(pid, (balances.get(pid) ?? 0) - share)
      }
    }

    const creditors = [...balances.entries()]
      .filter(([, v]) => v > 0.005)
      .map(([id, amount]) => ({ id, amount }))
      .sort((a, b) => b.amount - a.amount)

    const debtors = [...balances.entries()]
      .filter(([, v]) => v < -0.005)
      .map(([id, amount]) => ({ id, amount: -amount }))
      .sort((a, b) => b.amount - a.amount)

    const result: Transfer[] = []
    let i = 0, j = 0

    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount)
      const from = participants.value.find(p => p.id === debtors[i].id)
      const to = participants.value.find(p => p.id === creditors[j].id)

      if (!from || !to) { i++; j++; continue }

      result.push({
        fromId: from.id,
        fromName: from.name,
        toId: to.id,
        toName: to.name,
        toAlias: to.alias,
        amount: Math.round(amount * 100) / 100,
      })

      debtors[i].amount -= amount
      creditors[j].amount -= amount
      if (debtors[i].amount < 0.005) i++
      if (creditors[j].amount < 0.005) j++
    }

    return result
  })

  function reset() {
    participants.value = []
    expenses.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return { participants, expenses, transfers, addParticipant, removeParticipant, updateParticipant, addExpense, removeExpense, updateExpenseInclusions, expensesOf, reset }
}
