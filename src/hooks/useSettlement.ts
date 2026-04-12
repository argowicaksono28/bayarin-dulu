"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import type { Balance } from "@/types"

export function useSettlement(initialBalances: Balance[]) {
  const [balances, setBalances] = useState<Balance[]>(initialBalances)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync when data arrives from useMockDelay (initial value is [] before delay)
  useEffect(() => {
    if (initialBalances.length > 0) {
      setBalances(initialBalances)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBalances.length])

  function settle(balance: Balance) {
    const removedBalance = balance

    // Optimistic remove
    setBalances((prev) => prev.filter((b) => b.id !== balance.id))

    let countdown = 5
    const toastId = `settle-${balance.id}`

    function showToast() {
      toast(`Settlement recorded`, {
        id: toastId,
        duration: 5500,
        description: `Undo in ${countdown}s`,
        action: {
          label: "Undo",
          onClick: () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setBalances((prev) => {
              const exists = prev.find((b) => b.id === removedBalance.id)
              if (exists) return prev
              return [...prev, removedBalance]
            })
            toast.success("Settlement cancelled", { id: toastId })
          },
        },
      })
    }

    showToast()

    intervalRef.current = setInterval(() => {
      countdown -= 1
      if (countdown <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        toast.dismiss(toastId)
        // Persist the settlement to the server
        fetch(`/api/groups/${balance.groupId}/settlements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUserId: balance.fromUserId,
            toUserId: balance.toUserId,
            amount: balance.amount,
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Settlement failed")
          })
          .catch(() => {
            // Restore the balance on failure
            setBalances((prev) => {
              const exists = prev.find((b) => b.id === removedBalance.id)
              if (exists) return prev
              return [...prev, removedBalance]
            })
            toast.error("Failed to save settlement. Please try again.")
          })
      } else {
        showToast()
      }
    }, 1000)
  }

  return { balances, settle }
}
