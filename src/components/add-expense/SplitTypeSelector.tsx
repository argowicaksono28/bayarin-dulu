"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SplitEqualPanel } from "./SplitEqualPanel"
import { SplitPercentagePanel } from "./SplitPercentagePanel"
import { SplitExactPanel } from "./SplitExactPanel"
import { SplitSharesPanel } from "./SplitSharesPanel"
import type { SplitType, User } from "@/types"

interface Props {
  members: User[]
  totalAmount: number
  splitType: SplitType
  inputs: Record<string, number>
  onSplitTypeChange: (type: SplitType) => void
  onInputChange: (userId: string, value: number) => void
}

export function SplitTypeSelector({
  members,
  totalAmount,
  splitType,
  inputs,
  onSplitTypeChange,
  onInputChange,
}: Props) {
  return (
    <div>
      <p className="text-sm font-medium mb-3">Split Method</p>
      <Tabs value={splitType} onValueChange={(v) => onSplitTypeChange(v as SplitType)}>
        <TabsList className="w-full h-9 bg-card border border-border/50 rounded-lg p-1">
          <TabsTrigger value="equal" className="flex-1 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground">Equal</TabsTrigger>
          <TabsTrigger value="percentage" className="flex-1 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground">Percent</TabsTrigger>
          <TabsTrigger value="exact" className="flex-1 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground">Fixed</TabsTrigger>
          <TabsTrigger value="shares" className="flex-1 text-xs rounded-md data-[state=active]:bg-muted data-[state=active]:text-foreground">Shares</TabsTrigger>
        </TabsList>

        <div className="mt-3 border border-border/50 rounded-lg p-3 bg-card/30">
          <TabsContent value="equal" className="mt-0">
            <SplitEqualPanel members={members} totalAmount={totalAmount} />
          </TabsContent>
          <TabsContent value="percentage" className="mt-0">
            <SplitPercentagePanel
              members={members}
              totalAmount={totalAmount}
              inputs={inputs}
              onChange={onInputChange}
            />
          </TabsContent>
          <TabsContent value="exact" className="mt-0">
            <SplitExactPanel
              members={members}
              totalAmount={totalAmount}
              inputs={inputs}
              onChange={onInputChange}
            />
          </TabsContent>
          <TabsContent value="shares" className="mt-0">
            <SplitSharesPanel
              members={members}
              totalAmount={totalAmount}
              inputs={inputs}
              onChange={onInputChange}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
