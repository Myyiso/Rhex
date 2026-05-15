"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { InboxRealtimeProvider } from "@/components/inbox-realtime-provider"
import type { SiteSettingsData } from "@/lib/site-settings.types"
import type { UserSurfaceSnapshot } from "@/lib/user-surface"

export interface CurrentUserClient {
  id: number
  username: string
  nickname: string | null
  avatarPath: string | null
  role: string
  status: string
  level: number
  levelName: string | null
  levelColor: string | null
  levelIcon: string | null
  points: number
  vipLevel: number | null
  vipExpiresAt: string | null
}

interface CurrentUserPayload {
  user: CurrentUserClient | null
  surface: UserSurfaceSnapshot | null
}

interface ApiSuccessPayload<T> {
  code: 0
  data?: T
}

interface CurrentUserContextValue extends CurrentUserPayload {
  loading: boolean
  refresh: () => Promise<void>
  setCurrentUserPayload: (payload: CurrentUserPayload) => void
}

interface RhexClientWindow {
  _rhex?: {
    sdkVersion: 1
    session?: {
      isAuthenticated: boolean
      user: CurrentUserClient | null
    }
    site?: SiteSettingsData | null
  }
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  user: null,
  surface: null,
  loading: true,
  refresh: async () => undefined,
  setCurrentUserPayload: () => undefined,
})

function updateRhexSession(user: CurrentUserClient | null) {
  const clientWindow = window as unknown as RhexClientWindow
  const current = clientWindow._rhex
  clientWindow._rhex = {
    ...current,
    sdkVersion: 1,
    session: {
      isAuthenticated: Boolean(user),
      user,
    },
  }
}

function normalizePayload(payload: unknown): CurrentUserPayload {
  if (!payload || typeof payload !== "object") {
    return { user: null, surface: null }
  }

  const record = payload as Partial<CurrentUserPayload>
  return {
    user: record.user ?? null,
    surface: record.surface ?? null,
  }
}

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [payload, setPayload] = useState<CurrentUserPayload>({ user: null, surface: null })
  const [loading, setLoading] = useState(true)

  const setCurrentUserPayload = useCallback((nextPayload: CurrentUserPayload) => {
    setPayload(nextPayload)
    updateRhexSession(nextPayload.user)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin",
      })
      if (!response.ok) {
        setCurrentUserPayload({ user: null, surface: null })
        return
      }

      const result = await response.json() as ApiSuccessPayload<CurrentUserPayload>
      setCurrentUserPayload(normalizePayload(result.data))
    } catch {
      setCurrentUserPayload({ user: null, surface: null })
    } finally {
      setLoading(false)
    }
  }, [setCurrentUserPayload])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<CurrentUserContextValue>(() => ({
    ...payload,
    loading,
    refresh,
    setCurrentUserPayload,
  }), [loading, payload, refresh, setCurrentUserPayload])

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export function CurrentUserInboxProvider({ children, messagePromptAudioPath }: { children: React.ReactNode; messagePromptAudioPath?: string }) {
  const { user, surface } = useCurrentUser()

  return (
    <InboxRealtimeProvider
      key={`${user?.id ?? "guest"}:${surface?.unreadMessageCount ?? 0}:${surface?.unreadNotificationCount ?? 0}`}
      currentUserId={user?.id ?? null}
      initialUnreadMessageCount={surface?.unreadMessageCount ?? 0}
      initialUnreadNotificationCount={surface?.unreadNotificationCount ?? 0}
      messagePromptAudioPath={messagePromptAudioPath}
    >
      {children}
    </InboxRealtimeProvider>
  )
}

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
