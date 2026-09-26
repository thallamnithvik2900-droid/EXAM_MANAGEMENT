export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN", "FACULTY", "INVIGILATOR"], req);
    const halls = await prisma.hall.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(halls);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const b = await req.json();
    const hall = await prisma.hall.create({
      data: { hallCode: b.hallCode, name: b.name, building: b.building, floor: b.floor, capacity: b.capacity || 30, rows: b.rows || 5, cols: b.cols || 6 },
    });
    return NextResponse.json({ success: true, id: hall.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

