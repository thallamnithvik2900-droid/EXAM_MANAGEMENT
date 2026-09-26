export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "FACULTY"], req);
    const url = new URL(req.url);
    if (url.searchParams.get("type") === "departments") {
      const depts = await prisma.department.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(depts);
    }
    const subjects = await prisma.subject.findMany({
      include: { department: true }, orderBy: { name: "asc" },
    });
    return NextResponse.json(subjects.map(s => ({
      id: s.id, name: s.name, code: s.code, credits: s.credits, semester: s.semester,
      department: s.department?.name || "N/A", departmentId: s.departmentId,
    })));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const body = await req.json();
    const sub = await prisma.subject.create({
      data: { name: body.name, code: body.code, departmentId: body.departmentId, credits: body.credits || 3, semester: body.semester || 1 },
    });
    return NextResponse.json({ success: true, id: sub.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

