export interface Participant {
  id: string
  name: string
  alias: string | null
}

export interface Expense {
  id: string
  paidById: string
  amount: number
  description: string | null
  includedParticipantIds: string[]
}

export interface Transfer {
  fromId: string
  fromName: string
  toId: string
  toName: string
  toAlias: string | null
  amount: number
}
