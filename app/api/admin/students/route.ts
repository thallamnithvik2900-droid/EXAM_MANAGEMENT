export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const students = await prisma.student.findMany({
      include: { user: true, department: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(students.map(s => ({
      id: s.id, userId: s.userId, name: s.user.name, email: s.user.email,
      rollNumber: s.rollNumber, registrationNo: s.registrationNo,
      semester: s.semester, department: s.department?.name || "N/A",
      departmentId: s.departmentId, createdAt: s.createdAt.toISOString(),
    })));
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const body = await req.json();
    const { email, password, name, rollNumber, registrationNo, semester, departmentId } = body;
    const hash = await hashPassword(password || "Student@123");
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, name, role: "STUDENT" },
    });
    const student = await prisma.student.create({
      data: { userId: user.id, rollNumber, registrationNo, semester: semester || 1, departmentId },
    });
    return NextResponse.json({ success: true, id: student.id });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

