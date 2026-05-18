import path from "path"
import { fileURLToPath } from "url"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const isProductionBuild = process.env.NODE_ENV === "production"
const normalizeAssetPrefix = (value) => {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return undefined
  }

  return trimmedValue.replace(/\/+$/, "")
}
const assetPrefix = isProductionBuild
  ? normalizeAssetPrefix(process.env.NEXT_ASSET_PREFIX)
  : undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix,
  reactStrictMode: true,
  productionBrowserSourceMaps:false,
  typescript: {
    ignoreBuildErrors: isProductionBuild,
  },
  serverExternalPackages: ["@napi-rs/canvas", "ioredis", "ip2region", "nodemailer"],
  experimental: {
    serverSourceMaps:false,
    proxyClientMaxBodySize: "64mb",
    turbopackMemoryLimit: 1024 * 1024 * 1024,
  },
  turbopack: {
    root: projectRoot,
  }
}

export default nextConfig
