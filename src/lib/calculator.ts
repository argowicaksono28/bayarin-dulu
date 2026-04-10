import { create, evaluateDependencies } from "mathjs"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const math = create(evaluateDependencies as any)

export function evaluateExpression(expression: string): number | null {
  if (!expression || expression.trim() === "") return null
  try {
    // Replace visual operators with mathjs-compatible ones
    const normalized = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/,/g, "")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (math as any).evaluate(normalized)
    const num = typeof result === "number" ? result : Number(result)
    if (!isFinite(num) || isNaN(num) || num < 0) return null
    return Math.round(num)
  } catch {
    return null
  }
}

export function isValidExpression(expression: string): boolean {
  return evaluateExpression(expression) !== null
}
