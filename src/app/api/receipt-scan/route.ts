import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: "Receipt scanning not configured" }, { status: 503 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString("base64")
  const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp"

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `You are a receipt scanner. Extract the total amount and a short description (3-5 words) from this receipt image.
Respond ONLY with a raw JSON object — no markdown, no code fences, no explanation:
{"amount": <number, digits only, no currency symbol>, "description": "<short description in English>"}
If you cannot determine the total, use 0. Always output valid raw JSON.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    return NextResponse.json({ error: (err as any).error?.message ?? "AI service error" }, { status: 500 })
  }

  const result = await response.json()
  const raw = (result.content?.[0]?.text ?? "").trim()

  // Strip markdown code fences if Claude wraps the JSON anyway
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

  try {
    const parsed = JSON.parse(cleaned)
    return NextResponse.json({
      amount: typeof parsed.amount === "number" ? parsed.amount : 0,
      description: typeof parsed.description === "string" ? parsed.description : "",
    })
  } catch {
    console.error("Receipt scan raw response:", raw)
    return NextResponse.json({ error: "Failed to read receipt — try a clearer photo" }, { status: 500 })
  }
}
