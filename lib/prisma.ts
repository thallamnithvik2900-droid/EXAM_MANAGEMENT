import { PrismaClient } from "@prisma/client";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.startsWith("file:")) {
    const rawPath = dbUrl ? dbUrl.replace(/^file:/, "") : "./prisma/dev.db";
    if (!path.isAbsolute(rawPath)) {
      const cleanPath = rawPath.replace(/^\.\//, "");
      const fullPath = cleanPath.includes("prisma")
        ? path.join(process.cwd(), cleanPath)
        : path.join(process.cwd(), "prisma", cleanPath);
      return `file:${fullPath}`;
    }
  }
  return dbUrl;
}

const resolvedUrl = getDatabaseUrl();
if (resolvedUrl) {
  process.env.DATABASE_URL = resolvedUrl;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

