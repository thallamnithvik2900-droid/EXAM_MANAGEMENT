export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(["INVIGILATOR", "ADMIN", "FACULTY"], req);
    const { examScheduleId, studentId, status, notes, isConfirmed } = await req.json();
    
    const updateData: any = { status, notes, markedById: user.id };
    if (typeof isConfirmed === "boolean") {
      updateData.isConfirmed = isConfirmed;
      updateData.confirmedAt = isConfirmed ? new Date() : null;
    }

    const record = await prisma.attendance.upsert({
      where: { examScheduleId_studentId: { examScheduleId, studentId } },
      update: updateData,
      create: { 
        examScheduleId, 
        studentId, 
        status, 
        notes, 
        markedById: user.id,
        isConfirmed: isConfirmed ?? false,
        confirmedAt: isConfirmed ? new Date() : null,
      },
    });
    return NextResponse.json({ success: true, id: record.id, record });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

