import type { SplitType, SplitResult, Balance } from "@/types"

/** Debt simplification — reduces the number of transactions needed to settle all balances */
export function simplifyDebts(balances: Balance[]): Balance[] {
  if (balances.length === 0) return []

  // Net balance per user: positive = owed money, negative = owes money
  const net = new Map<string, number>()
  for (const b of balances) {
    net.set(b.fromUserId, (net.get(b.fromUserId) ?? 0) - b.amount)
    net.set(b.toUserId, (net.get(b.toUserId) ?? 0) + b.amount)
  }

  const creditors: { id: string; amount: number }[] = []
  const debtors: { id: string; amount: number }[] = []

  for (const [id, amount] of net) {
    if (amount > 0.5) creditors.push({ id, amount: Math.round(amount) })
    else if (amount < -0.5) debtors.push({ id, amount: Math.round(-amount) })
  }

  const simplified: Balance[] = []
  let ci = 0
  let di = 0
  let counter = 0
  const groupId = balances[0].groupId

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    const amount = Math.min(creditor.amount, debtor.amount)

    simplified.push({
      id: `sim_${counter++}`,
      groupId,
      fromUserId: debtor.id,
      toUserId: creditor.id,
      amount,
    })

    creditor.amount -= amount
    debtor.amount -= amount
    if (creditor.amount === 0) ci++
    if (debtor.amount === 0) di++
  }

  return simplified
}

export function computeSplits(
  totalAmount: number,
  memberIds: string[],
  splitType: SplitType,
  inputs: Record<string, number>
): SplitResult {
  if (memberIds.length === 0) {
    return { splits: {}, isValid: false, errorMessage: "No members" }
  }

  switch (splitType) {
    case "equal": {
      const perPerson = Math.floor(totalAmount / memberIds.length)
      const remainder = totalAmount - perPerson * memberIds.length
      const splits: Record<string, number> = {}
      memberIds.forEach((id, idx) => {
        splits[id] = perPerson + (idx === memberIds.length - 1 ? remainder : 0)
      })
      return { splits, isValid: true }
    }

    case "percentage": {
      const totalPct = Object.values(inputs).reduce((s, v) => s + (v || 0), 0)
      if (Math.abs(totalPct - 100) > 0.01) {
        const diff = 100 - totalPct
        return {
          splits: {},
          isValid: false,
          errorMessage: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}% off from 100%`,
        }
      }
      const splits: Record<string, number> = {}
      let assigned = 0
      memberIds.forEach((id, idx) => {
        if (idx === memberIds.length - 1) {
          splits[id] = totalAmount - assigned
        } else {
          const amt = Math.floor(totalAmount * ((inputs[id] || 0) / 100))
          splits[id] = amt
          assigned += amt
        }
      })
      return { splits, isValid: true }
    }

    case "exact": {
      const totalExact = Object.values(inputs).reduce((s, v) => s + (v || 0), 0)
      if (Math.abs(totalExact - totalAmount) > 1) {
        const diff = totalAmount - totalExact
        return {
          splits: { ...inputs },
          isValid: false,
          errorMessage: `${diff > 0 ? "+" : ""}${diff.toLocaleString()} off from total`,
        }
      }
      return { splits: { ...inputs }, isValid: true }
    }

    case "shares": {
      const totalShares = Object.values(inputs).reduce((s, v) => s + (v || 0), 0)
      if (totalShares === 0) {
        return { splits: {}, isValid: false, errorMessage: "Total shares must be > 0" }
      }
      const splits: Record<string, number> = {}
      let assigned = 0
      memberIds.forEach((id, idx) => {
        if (idx === memberIds.length - 1) {
          splits[id] = totalAmount - assigned
        } else {
          const amt = Math.floor(totalAmount * ((inputs[id] || 0) / totalShares))
          splits[id] = amt
          assigned += amt
        }
      })
      return { splits, isValid: true }
    }
  }
}
