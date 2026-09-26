import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import { SessionUser, Role } from "@/types";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-jwt-exam-portal-secret-key-2026-prod";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      facultyId: user.facultyId,
      rollNumber: user.rollNumber,
      departmentName: user.departmentName,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<SessionUser | null> {
  let token: string | undefined;

  if (req) {
    // 1. From request cookies
    token = req.cookies.get("auth-token")?.value;

    // 2. From Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    // Server component / Route handler context
    try {
      const cookieStore = cookies();
      token = cookieStore.get("auth-token")?.value;
    } catch {
      // Ignored if outside request context
    }

    if (!token) {
      try {
        const headerStore = headers();
        const authHeader = headerStore.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      } catch {
        // Ignored
      }
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(allowedRoles?: Role[], req?: NextRequest): Promise<SessionUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
