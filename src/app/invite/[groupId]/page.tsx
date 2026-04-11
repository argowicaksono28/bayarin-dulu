"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Users, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type State = "loading" | "joining" | "success" | "error" | "already"

export default function InvitePage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router = useRouter()
  const [state, setState] = useState<State>("loading")
  const [groupName, setGroupName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    async function joinGroup() {
      setState("joining")
      try {
        const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" })
        const data = await res.json()

        if (!res.ok) {
          // If unauthorized, redirect to auth with redirect back
          if (res.status === 401) {
            router.push(`/auth?redirect=/invite/${groupId}`)
            return
          }
          setErrorMsg(data.error ?? "Failed to join group")
          setState("error")
          return
        }

        if (data.alreadyMember) {
          setState("already")
        } else {
          setState("success")
        }
        setGroupName(data.groupName ?? "the group")
      } catch {
        setErrorMsg("Something went wrong")
        setState("error")
      }
    }

    joinGroup()
  }, [groupId, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-sm w-full space-y-6 text-center">
        {(state === "loading" || state === "joining") && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div>
              <p className="font-semibold text-lg">Joining group…</p>
              <p className="text-sm text-muted-foreground mt-1">Please wait</p>
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <p className="font-semibold text-lg">You joined!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome to {groupName || "the group"}
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push(`/groups/${groupId}`)}>
              Go to Group
            </Button>
          </>
        )}

        {state === "already" && (
          <>
            <Users className="h-12 w-12 text-primary mx-auto" />
            <div>
              <p className="font-semibold text-lg">Already a member</p>
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;re already in this group
              </p>
            </div>
            <Button className="w-full" onClick={() => router.push(`/groups/${groupId}`)}>
              Go to Group
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <p className="font-semibold text-lg">Could not join</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
