"use client"

import { useState, useEffect, useCallback } from "react"
import type { Notification } from "@/types"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Map snake_case from DB to camelCase
          setNotifications(
            data.map((n: any) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              body: n.body,
              isRead: n.is_read,
              groupId: n.group_id,
              actorId: n.actor_id,
              actor: n.actor ?? null,
              createdAt: n.created_at,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  async function markAllRead() {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" })
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {})
  }

  return { notifications, unreadCount, markAllRead, markRead }
}
