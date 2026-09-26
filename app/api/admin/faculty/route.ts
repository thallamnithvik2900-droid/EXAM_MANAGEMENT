export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const faculty = await prisma.faculty.findMany({
      include: { user: true, department: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(faculty.map(f => ({
      id: f.id, userId: f.userId, name: f.user.name, email: f.user.email,
      employeeId: f.employeeId, designation: f.designation,
      department: f.department?.name || "N/A", departmentId: f.departmentId,
      role: f.user.role, createdAt: f.createdAt.toISOString(),
    })));
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const body = await req.json();
    const { email, password, name, employeeId, designation, departmentId, role } = body;
    const hash = await hashPassword(password || "Faculty@123");
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, name, role: role || "FACULTY" },
    });
    const fac = await prisma.faculty.create({
      data: { userId: user.id, employeeId, designation: designation || "Assistant Professor", departmentId },
    });
    return NextResponse.json({ success: true, id: fac.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

