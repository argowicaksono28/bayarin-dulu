import type { ReactNode } from "react"
import { DemoProvider } from "@/contexts/DemoContext"
import { DemoShell } from "@/components/demo/DemoShell"

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <DemoShell>
        {children}
      </DemoShell>
    </DemoProvider>
  )
}
