"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { evaluateExpression } from "@/lib/calculator"
import { formatIDR } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { Delete } from "lucide-react"

interface Props {
  initialValue?: number
  onConfirm: (value: number) => void
  onCancel: () => void
}

const KEYS = [
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  [".", "0", "⌫", "+"],
]

export function CalculatorKeyboard({ initialValue, onConfirm, onCancel }: Props) {
  const [expression, setExpression] = useState(
    initialValue && initialValue > 0 ? String(initialValue) : ""
  )
  const [shake, setShake] = useState(false)

  const evaluated = evaluateExpression(expression)
  const displayValue = evaluated !== null ? formatIDR(evaluated) : expression || "0"

  function pressKey(key: string) {
    if (key === "⌫") {
      setExpression((prev) => prev.slice(0, -1))
      return
    }
    if (key === "C") {
      setExpression("")
      return
    }
    setExpression((prev) => prev + key)
  }

  function handleConfirm() {
    const result = evaluateExpression(expression)
    if (result === null || result <= 0) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    onConfirm(result)
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
      {/* Display */}
      <div className={cn(
        "p-4 bg-muted/40 min-h-[80px] flex flex-col items-end justify-end transition-transform",
        shake && "animate-bounce"
      )}>
        <p className="text-xs text-muted-foreground mb-1 font-mono">{expression || "0"}</p>
        <p className="text-2xl font-bold text-primary">{displayValue}</p>
      </div>

      {/* Keys */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {KEYS.map((row, ri) =>
          row.map((key) => (
            <Button
              key={`${ri}-${key}`}
              variant={["+", "−", "×", "÷"].includes(key) ? "secondary" : "outline"}
              className={cn(
                "h-12 text-lg font-medium",
                key === "⌫" && "text-destructive"
              )}
              onClick={() => pressKey(key)}
            >
              {key === "⌫" ? <Delete className="h-4 w-4" /> : key}
            </Button>
          ))
        )}
        {/* Full-width confirm row */}
        <Button
          variant="ghost"
          className="col-span-2 h-12 text-muted-foreground"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="col-span-2 h-12 text-base font-semibold"
          onClick={handleConfirm}
        >
          ✓ Confirm
        </Button>
      </div>
    </div>
  )
}
