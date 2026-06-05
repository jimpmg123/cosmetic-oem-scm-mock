"use client";

import { OpsMockPage } from "@/components/operations/ops-mock-page";
import { useLocale } from "@/components/providers/locale-provider";

const MOCK_EXCEPTIONS = [
  { id: "ex-001", type: "b_c_gap", bundle: "mb-2026-002", summaryKey: "exceptions.mock.ex001" },
  { id: "ex-002", type: "transit", bundle: "mb-2026-001", summaryKey: "exceptions.mock.ex002" },
] as const;

export default function ExceptionsPage() {
  const { t } = useLocale();
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
            <span>{t(e.summaryKey)}</span>
            <span className="text-scm-on-surface-variant">{e.bundle}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
