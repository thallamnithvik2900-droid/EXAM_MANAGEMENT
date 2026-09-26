export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"], req);
    const results = await prisma.result.findMany({ include: { exam: { include: { subject: true } } } });
    const passCount = results.filter(r => r.isPassed).length;
    const failCount = results.filter(r => !r.isPassed).length;
    const subjectMap: Record<string, { total: number; sumPct: number; pass: number; fail: number }> = {};
    for (const r of results) {
      const s = r.exam.subject.name;
      if (!subjectMap[s]) subjectMap[s] = { total: 0, sumPct: 0, pass: 0, fail: 0 };
      subjectMap[s].total++;
      subjectMap[s].sumPct += r.percentage;
      if (r.isPassed) subjectMap[s].pass++; else subjectMap[s].fail++;
    }
    const subjectStats = Object.entries(subjectMap).map(([name, v]) => ({
      subject: name, total: v.total, avgPercentage: Math.round(v.sumPct / v.total), pass: v.pass, fail: v.fail,
    }));
    const attendance = await prisma.attendance.findMany();
    const attPresent = attendance.filter(a => a.status === "PRESENT").length;
    const attAbsent = attendance.filter(a => a.status === "ABSENT").length;
    const attLate = attendance.filter(a => a.status === "LATE").length;
    return NextResponse.json({
      totalResults: results.length, passCount, failCount, subjectStats,
      attendance: { total: attendance.length, present: attPresent, absent: attAbsent, late: attLate },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

