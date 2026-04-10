"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatIDR } from "@/lib/formatters"

interface Props {
  baseAmount: number
  tax: number
  serviceCharge: number
  onTaxChange: (pct: number) => void
  onServiceChange: (pct: number) => void
}

export function TaxServiceAccordion({
  baseAmount,
  tax,
  serviceCharge,
  onTaxChange,
  onServiceChange,
}: Props) {
  const taxAmount = Math.round(baseAmount * (tax / 100))
  const serviceAmount = Math.round(baseAmount * (serviceCharge / 100))
  const total = baseAmount + taxAmount + serviceAmount

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="tax-service" className="border border-border/50 rounded-lg px-3 bg-card/30">
        <AccordionTrigger className="text-sm py-3">
          Tax & Service Charge
          {(tax > 0 || serviceCharge > 0) && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              +{formatIDR(taxAmount + serviceAmount)}
            </span>
          )}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 pb-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Tax (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={tax || ""}
                    onChange={(e) => onTaxChange(parseFloat(e.target.value) || 0)}
                    placeholder="11"
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Service (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={serviceCharge || ""}
                    onChange={(e) => onServiceChange(parseFloat(e.target.value) || 0)}
                    placeholder="5"
                    className="pr-6"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Live breakdown */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatIDR(baseAmount)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({tax}%)</span>
                  <span>+{formatIDR(taxAmount)}</span>
                </div>
              )}
              {serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service ({serviceCharge}%)</span>
                  <span>+{formatIDR(serviceAmount)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatIDR(total)}</span>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
