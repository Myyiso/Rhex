import { apiSuccess, createRouteHandler } from "@/lib/api-route"
import { getCurrentUser } from "@/lib/auth"
import { getLevelBadgeData } from "@/lib/level-badge"
import { resolveUserSurfaceSnapshot } from "@/lib/user-surface"

export const dynamic = "force-dynamic"

export const GET = createRouteHandler(async () => {

  const user = await getCurrentUser()
  const [surface, levelBadge] = await Promise.all([
    resolveUserSurfaceSnapshot(user),
    user ? getLevelBadgeData(Math.max(1, user.level ?? 1)) : Promise.resolve(null),
  ])
  return apiSuccess({
    user: user
      ? {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatarPath: user.avatarPath,
          role: user.role,
          status: user.status,
          level: user.level,
          levelName: levelBadge?.name ?? null,
          levelColor: levelBadge?.color ?? null,
          levelIcon: levelBadge?.icon ?? null,
          points: user.points,
          vipLevel: user.vipLevel,
          vipExpiresAt: user.vipExpiresAt?.toString?.() ?? null,
        }
      : null,
    surface,
  }, "success")
}, {
  errorMessage: "获取当前用户失败",
  logPrefix: "[api/auth/me] unexpected error",
})

