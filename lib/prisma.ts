import { PrismaClient } from "@prisma/client";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | null | undefined;
}

function createPrismaClient(): PrismaClient | null {
  try {
    if (global.prismaInstance !== undefined) {
      return global.prismaInstance;
    }

    const dbUrl = process.env.DATABASE_URL;
    let resolvedUrl = dbUrl;

    if (!dbUrl || dbUrl.startsWith("file:")) {
      const rawPath = dbUrl ? dbUrl.replace(/^file:/, "") : "./prisma/dev.db";
      if (!path.isAbsolute(rawPath)) {
        const cleanPath = rawPath.replace(/^\.\//, "");
        const fullPath = cleanPath.includes("prisma")
          ? path.join(process.cwd(), cleanPath)
          : path.join(process.cwd(), "prisma", cleanPath);
        resolvedUrl = `file:${fullPath}`;
      }
    }

    if (resolvedUrl) {
      process.env.DATABASE_URL = resolvedUrl;
    }

    const client = new PrismaClient({
      datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
      log: ["error"],
    });

    if (process.env.NODE_ENV !== "production") {
      global.prismaInstance = client;
    }

    return client;
  } catch (err) {
    console.warn("Prisma Client initialization skipped or failed:", err);
    global.prismaInstance = null;
    return null;
  }
}

// Export a Proxy for `prisma` that intercepts property accesses safely
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    const client = createPrismaClient();
    if (!client) {
      return new Proxy(() => {}, {
        get() {
          return async () => {
            throw new Error("Prisma client unavailable in this environment");
          };
        },
        apply() {
          return async () => {
            throw new Error("Prisma client unavailable in this environment");
          };
        },
      });
    }
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
