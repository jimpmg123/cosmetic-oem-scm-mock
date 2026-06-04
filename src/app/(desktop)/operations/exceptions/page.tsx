"use client";

import { OpsMockPage } from "@/components/operations/ops-mock-page";

const MOCK_EXCEPTIONS = [
  {
    id: "ex-001",
    type: "b_c_gap",
    bundle: "mb-2026-002",
    summary: "B 출하 120 vs C 입고 115",
  },
  {
    id: "ex-002",
    type: "transit",
    bundle: "mb-2026-001",
    summary: "A 출하 1200 vs B 확인 1180",
  },
];

export default function ExceptionsPage() {
  return (
    <div className="space-y-6">
      <OpsMockPage
        titleKey="exceptions.title"
        descKey="exceptions.desc"
        specPath="reconciliation-yield.md"
        related={[
          { href: "/operations/reconciliation", labelKey: "nav.reconciliation" },
        ]}
      />
      <ul className="space-y-2 rounded-lg border border-scm-outline-variant p-4 text-sm">
        {MOCK_EXCEPTIONS.map((e) => (
          <li key={e.id} className="flex justify-between gap-4">
            <span className="font-mono text-xs text-scm-on-surface-variant">
              {e.id}
            </span>
            <span>{e.summary}</span>
            <span className="text-scm-on-surface-variant">{e.bundle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
