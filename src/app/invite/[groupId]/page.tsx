"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Users, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GuestLinkDialog } from "@/components/invite/GuestLinkDialog"

type State = "loading" | "joining" | "success" | "error" | "already"

interface GuestCandidate {
  id: string
  name: string
  initials: string
}

export default function InvitePage() {
  const { groupId } = useParams<{ groupId: string }>()
  const router = useRouter()
  const [state, setState] = useState<State>("loading")
  const [groupName, setGroupName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [guestCandidates, setGuestCandidates] = useState<GuestCandidate[]>([])
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  useEffect(() => {
    async function joinGroup() {
      setState("joining")
      try {
        const res = await fetch(`/api/groups/${groupId}/join`, { method: "POST" })
        const data = await res.json()

        if (!res.ok) {
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
          // After joining, check for guest members that match the user's name
          await checkForGuestMatches(data.groupName ?? "")
        }
        setGroupName(data.groupName ?? "the group")
      } catch {
        setErrorMsg("Something went wrong")
        setState("error")
      }
    }

    async function checkForGuestMatches(gName: string) {
      try {
        // Get the current user's name
        const meRes = await fetch("/api/auth/me")
        const me = await meRes.json()
        if (!me?.name) return

        const myName = me.name.toLowerCase().trim()

        // Fetch guests in this group
        const guestRes = await fetch(`/api/groups/${groupId}/guests`)
        const guests = await guestRes.json()
        if (!Array.isArray(guests) || guests.length === 0) return

        // Find guests whose name is a close match (contains or is contained by user's name)
        const candidates = guests.filter((g: any) => {
          const guestName = (g.name ?? "").toLowerCase().trim()
          return (
            guestName === myName ||
            myName.includes(guestName) ||
            guestName.includes(myName) ||
            // First name match
            guestName.split(" ")[0] === myName.split(" ")[0]
          )
        })

        if (candidates.length > 0) {
          setGuestCandidates(candidates)
          setShowLinkDialog(true)
        }
      } catch {
        // Non-critical — just skip linking
      }
    }

    joinGroup()
  }, [groupId, router])

  function handleLinked() {
    setShowLinkDialog(false)
  }

  function handleSkipLink() {
    setShowLinkDialog(false)
  }

  return (
    <div className="flex items-center justify-center p-6 py-20">
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

      {showLinkDialog && (
        <GuestLinkDialog
          groupId={groupId}
          candidates={guestCandidates}
          onLinked={handleLinked}
          onSkip={handleSkipLink}
        />
      )}
    </div>
  )
}
