"use client";

import {
  SECTION_RAIL_DEMO_ITEMS,
  SectionRailDemoContent,
} from "@/components/dev/section-rail-demo-content";
import { SectionRailNav } from "@/components/ui/section-rail-nav";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";

/**
 * Test page for SectionRailNav — /dev/section-rail
 * Not linked in production nav; open URL directly during UI work.
 */
export default function SectionRailDevPage() {
  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm text-scm-on-surface-variant">
        <Link
          href="/operations/material-bundles"
          className="inline-flex items-center gap-1 hover:text-scm-primary"
        >
          <MaterialIcon name="arrow_back" className="text-[18px]" />
          Material bundles
        </Link>
        <span>/</span>
        <span className="text-scm-primary">Section rail (dev)</span>
      </div>

      <SectionRailDemoContent />
      <SectionRailNav sections={SECTION_RAIL_DEMO_ITEMS} scrollOffsetPx={72} />
    </>
  );
}
