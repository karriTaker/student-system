import { PrismaClient } from "../generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

let client: PrismaClient | null = null
let initPromise: Promise<void> | null = null

async function getClient(): Promise<PrismaClient> {
  if (client) return client
  if (!initPromise) {
    initPromise = (async () => {
      const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db"
      const authToken = process.env.TURSO_AUTH_TOKEN
      const config: { url: string; authToken?: string } = { url: dbUrl }
      if (authToken) {
        config.authToken = authToken
      }
      const factory = new PrismaLibSql(config)
      client = new PrismaClient({ adapter: factory })
    })()
  }
  await initPromise
  return client!
}

function createPrismaProxy(): PrismaClient {
  const handler: ProxyHandler<PrismaClient> = {
    get(target, prop) {
      if (typeof prop === 'symbol') return undefined
      const propHandler: ProxyHandler<any> = {
        get(target2, method) {
          return async (...args: any[]) => {
            const c = await getClient()
            const ctx = (c as any)[prop]
            return ctx[method](...args)
          }
        }
      }
      return new Proxy({}, propHandler)
    }
  }
  return new Proxy({} as PrismaClient, handler)
}

export const prisma = createPrismaProxy()
