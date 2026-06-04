"use client";

import { Suspense } from "react";
import ReceivingForm from "./receiving-form";

export default function ReceivingPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading…</div>}>
      <ReceivingForm />
    </Suspense>
  );
}
