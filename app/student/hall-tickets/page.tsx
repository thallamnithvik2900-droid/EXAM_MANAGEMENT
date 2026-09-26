"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Ticket, Printer, Building2, Calendar, Clock, User, ShieldCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function HallTicketsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<any>(null);

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch("/api/student/hall-tickets");
        const json = await res.json();
        if (res.ok) {
          setData(json);
          if (json.tickets && json.tickets.length > 0) {
            setActiveTicket(json.tickets[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Loading official hall tickets...</p>
        </div>
      </DashboardLayout>
    );
  }

  const { student, tickets } = data || {};

  return (
    <DashboardLayout>
      <div className="space-y-8 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examination Hall Tickets</h1>
            <p className="text-xs text-slate-500">
              Official university admit cards with hall allocations and allocated seat coordinates.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Admit Card</span>
          </button>
        </div>

        {/* Ticket Selector Tabs (if multiple) */}
        {tickets && tickets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-print">
            {tickets.map((t: any) => (
              <button
                key={t.allocationId}
                onClick={() => setActiveTicket(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition ${
                  activeTicket?.allocationId === t.allocationId
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.examTitle}
              </button>
            ))}
          </div>
        )}

        {/* Official Printable Admit Card */}
        {activeTicket ? (
          <div className="bg-white rounded-3xl border-2 border-slate-800 p-8 shadow-lg max-w-4xl mx-auto print:shadow-none print:border-2 print:border-black print:rounded-none">
            {/* Institution Header */}
            <div className="text-center pb-6 border-b-2 border-slate-800">
              <div className="text-xl font-black uppercase tracking-wider text-slate-900">
                National Institute of Technology & Assessment
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-800 mt-1">
                Office of the Controller of Examinations &bull; Academic Year 2026
              </div>
              <div className="inline-block mt-3 px-4 py-1 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-widest print:border print:border-black print:bg-white print:text-black">
                Official Examination Hall Ticket / Admit Card
              </div>
            </div>

            {/* Student Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-0.5">Candidate Name</span>
                <span className="font-bold text-slate-900 text-sm">{student?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-0.5">Roll Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{student?.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-0.5">Registration No</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{student?.registrationNo}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-0.5">Department / Sem</span>
                <span className="font-bold text-slate-900">{student?.department} (Sem {student?.semester})</span>
              </div>
            </div>

            {/* Exam & Seat Allocation Details */}
            <div className="py-6 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Assigned Examination Details
              </h3>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-slate-500 text-xs block mb-1">Subject & Course:</span>
                  <div className="font-bold text-slate-900 text-base">{activeTicket.examTitle}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">Code: {activeTicket.examCode}</div>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block mb-1">Date & Time Slot:</span>
                  <div className="font-bold text-slate-900 text-base">{formatDate(activeTicket.date)}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">
                    {activeTicket.startTime} - {activeTicket.endTime} ({activeTicket.durationMinutes} Mins)
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Attendance Status</span>
                    {activeTicket.isConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {activeTicket.attendanceStatus} (Confirmed)
                      </span>
                    ) : activeTicket.attendanceStatus !== "NOT_MARKED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                        {activeTicket.attendanceStatus} (Pending Confirmation)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        Not Marked Yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-indigo-500 text-center flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Allocated Seat</span>
                  <div className="text-2xl font-black font-mono text-indigo-900 mt-0.5">
                    {activeTicket.seatNumber}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-semibold">
                    {activeTicket.hallName} ({activeTicket.hallCode})
                  </div>
                  <div className="text-[10px] text-slate-400">{activeTicket.building}, {activeTicket.floor}</div>
                </div>
              </div>
            </div>

            {/* Examination Instructions */}
            <div className="py-6 text-xs text-slate-600 space-y-2 leading-relaxed">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Candidate Guidelines & Instructions:
              </h4>
              <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                <li>Candidates must present this Hall Ticket along with a valid Institutional Photo ID card at the examination venue.</li>
                <li>Candidates should report to the designated hall at least 15 minutes before the scheduled start time.</li>
                <li>Electronic gadgets, smartwatches, programmable calculators, and unauthorized materials are strictly prohibited.</li>
                <li>Candidates must occupy only the designated seat number allocated above (<span className="font-bold">{activeTicket.seatNumber}</span>).</li>
                <li>Any candidate found guilty of unfair means or malpractice will be subject to disciplinary action by the Invigilator.</li>
              </ol>
            </div>

            {/* Signature Area */}
            <div className="pt-10 flex items-center justify-between border-t border-slate-200 text-xs">
              <div className="text-center">
                <div className="w-44 border-b border-slate-800 mb-1" />
                <span className="text-slate-500 text-[10px] uppercase font-bold">Candidate Signature</span>
              </div>

              <div className="text-center">
                <div className="w-44 border-b border-slate-800 mb-1 flex items-center justify-center font-serif text-indigo-900 italic font-bold">
                  Dr. Vikram Seth
                </div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Controller of Examinations</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No scheduled hall ticket available. Online mock exams do not require a hall ticket.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
