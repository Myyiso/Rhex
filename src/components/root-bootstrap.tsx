"use client"

import { useLayoutEffect } from "react"

import { preloadReadingHistorySnapshot } from "@/lib/local-reading-history"
import { resetSidebarNavigationCollapsedPreference } from "@/lib/sidebar-navigation-preference"
import { applyTheme, readThemeLocalSettingsSnapshot, type ThemeRuntimeSettings } from "@/lib/theme"

export function RootBootstrap({ themeSettings }: { themeSettings?: ThemeRuntimeSettings }) {
  useLayoutEffect(() => {
    try {
      const settings = readThemeLocalSettingsSnapshot(themeSettings)

      applyTheme(settings.preference, settings.preset, settings.fontSizePreset, themeSettings)
      resetSidebarNavigationCollapsedPreference()
      preloadReadingHistorySnapshot()
    } finally {
      document.documentElement.setAttribute("data-root-init", "ready")
    }
  }, [themeSettings])

  return null
}
