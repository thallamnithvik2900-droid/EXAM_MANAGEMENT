export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { MOCK_USERS } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let sessionUser: any = null;

    // 1. Try Prisma DB first if database is active
    try {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          student: { include: { department: true } },
          faculty: { include: { department: true } },
        },
      });

      if (user) {
        const isMatch = await comparePassword(password, user.passwordHash);
        if (isMatch) {
          sessionUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as any,
            studentId: user.student?.id,
            facultyId: user.faculty?.id,
            rollNumber: user.student?.rollNumber,
            departmentName: user.student?.department?.name || user.faculty?.department?.name,
          };
        }
      }
    } catch (dbError) {
      console.warn("Database connection issue. Falling back to mock authentication:", dbError);
    }

    // 2. Fallback to in-memory mock demo users if DB is not connected or user is not found in DB
    if (!sessionUser) {
      const mockUser = MOCK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
      if (
        mockUser &&
        (password === mockUser.password || (await comparePassword(password, mockUser.passwordHash)))
      ) {
        sessionUser = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          studentId: mockUser.studentId,
          facultyId: mockUser.facultyId,
          rollNumber: mockUser.rollNumber,
          departmentName: mockUser.departmentName,
        };
      }
    }

    if (!sessionUser) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    // Set HTTP-only auth-token cookie
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 });
  }
}
