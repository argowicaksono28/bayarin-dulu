"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Mail } from "lucide-react"

const schema = z.object({
  email: z.string().email("Invalid email"),
})

type Values = z.infer<typeof schema>

export function MagicLinkForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: Values) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <p className="font-medium text-foreground">Magic link sent!</p>
        <p className="text-sm text-muted-foreground">
          Check your inbox at <strong>{form.getValues("email")}</strong> and click the link to sign in.
        </p>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSent(false)}>
          Send again
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg bg-muted/50 border border-border/50 p-3 text-sm text-muted-foreground">
          We&apos;ll send a sign-in link to your email — no password needed.
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="you@email.com" type="email" className="bg-muted/50 border-border/50" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? "Sending…" : "Send Magic Link"}
        </Button>
      </form>
    </Form>
  )
}
