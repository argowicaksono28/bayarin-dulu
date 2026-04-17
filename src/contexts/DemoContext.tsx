"use client"

import { createContext, useContext, useReducer, useMemo, type ReactNode } from "react"
import { formatIDR } from "@/lib/formatters"
import type { User, Group, Expense, Balance, Activity } from "@/types"
export { DEMO_CURRENT_USER_ID } from "@/lib/demo-data"

import {
  DEMO_CURRENT_USER_ID,
  demoUsers,
  demoGroups,
  demoExpenses,
  demoBalances,
  demoActivities,
  getDemoUserById,
  getDemoGroupById,
  getDemoExpensesByGroupId,
  getDemoBalancesByGroupId,
  getDemoActivitiesByGroupId,
  getDemoMembersByGroupId,
  computeBalancesForGroup,
} from "@/lib/demo-data"

// ─── State ────────────────────────────────────────────────────────────────

interface DemoState {
  users: User[]
  groups: Group[]
  expenses: Expense[]
  balances: Balance[]
  activities: Activity[]
}

const initialState: DemoState = {
  users: demoUsers,
  groups: demoGroups,
  expenses: demoExpenses,
  balances: demoBalances,
  activities: demoActivities,
}

// ─── Actions ──────────────────────────────────────────────────────────────

type DemoAction =
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "SETTLE_BALANCE"; balanceId: string; groupId: string; amount: number; fromName: string; toName: string }

// ─── Reducer ──────────────────────────────────────────────────────────────

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "ADD_EXPENSE": {
      const exp = action.payload
      const newExpenses = [exp, ...state.expenses]

      // Recompute net balances for the affected group from scratch
      const updatedGroupBalances = computeBalancesForGroup(exp.groupId, newExpenses, state.users)
      const newBalances = [
        ...state.balances.filter((b) => b.groupId !== exp.groupId),
        ...updatedGroupBalances,
      ]

      const myShare = (exp.splits[DEMO_CURRENT_USER_ID] as number | undefined) ?? 0
      const iPaid = exp.paidBy === DEMO_CURRENT_USER_ID
      const balanceDelta = iPaid ? exp.amount - myShare : -myShare

      const newActivity: Activity = {
        id: `act_demo_${Date.now()}`,
        groupId: exp.groupId,
        type: "expense_added",
        actorId: DEMO_CURRENT_USER_ID,
        actor: { id: "usr_001", name: "Budi Santoso", initials: "BS", avatarUrl: null },
        expenseId: exp.id,
        amount: exp.amount,
        description: `Budi added "${exp.description}"`,
        createdAt: new Date(),
      }

      return {
        ...state,
        expenses: newExpenses,
        balances: newBalances,
        activities: [newActivity, ...state.activities],
        groups: state.groups.map((g) =>
          g.id === exp.groupId
            ? { ...g, totalExpenses: g.totalExpenses + exp.amount, myBalance: g.myBalance + balanceDelta }
            : g
        ),
      }
    }

    case "SETTLE_BALANCE": {
      const newActivity: Activity = {
        id: `act_settle_${Date.now()}`,
        groupId: action.groupId,
        type: "settlement",
        actorId: DEMO_CURRENT_USER_ID,
        actor: { id: "usr_001", name: "Budi Santoso", initials: "BS", avatarUrl: null },
        amount: action.amount,
        description: `${action.fromName} paid ${formatIDR(action.amount)} to ${action.toName}`,
        createdAt: new Date(),
      }

      return {
        ...state,
        balances: state.balances.filter((b) => b.id !== action.balanceId),
        activities: [newActivity, ...state.activities],
      }
    }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────

interface DemoContextValue {
  state: DemoState
  dispatch: React.Dispatch<DemoAction>
  currentUser: User
  getGroupById: (id: string) => Group | undefined
  getExpensesByGroupId: (id: string) => Expense[]
  getBalancesByGroupId: (id: string) => Balance[]
  getActivitiesByGroupId: (id: string) => Activity[]
  getMembersByGroupId: (id: string) => User[]
}

const DemoContext = createContext<DemoContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState)
  const currentUser = getDemoUserById(DEMO_CURRENT_USER_ID)

  const value = useMemo<DemoContextValue>(() => ({
    state,
    dispatch,
    currentUser,
    getGroupById: (id) => state.groups.find((g) => g.id === id),
    getExpensesByGroupId: (id) =>
      state.expenses
        .filter((e) => e.groupId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    getBalancesByGroupId: (id) => state.balances.filter((b) => b.groupId === id),
    getActivitiesByGroupId: (id) =>
      state.activities
        .filter((a) => a.groupId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    getMembersByGroupId: (id) => {
      const group = state.groups.find((g) => g.id === id)
      if (!group) return []
      return group.memberIds.map((uid) => state.users.find((u) => u.id === uid)!).filter(Boolean)
    },
  }), [state, currentUser])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error("useDemo must be used within DemoProvider")
  return ctx
}
