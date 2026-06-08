import { PrismaClient } from "../generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db"

let client: PrismaClient | null = null
let initPromise: Promise<void> | null = null

async function getClient(): Promise<PrismaClient> {
  if (client) return client
  if (!initPromise) {
    initPromise = (async () => {
      const factory = new PrismaLibSql({ url: dbUrl })
      client = new PrismaClient({ adapter: factory })
    })()
  }
  await initPromise
  return client!
}

// Proxy to transparently handle async initialization
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
