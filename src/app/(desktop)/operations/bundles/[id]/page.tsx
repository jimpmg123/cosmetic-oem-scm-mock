"use client";

import { use } from "react";
import { BundleDetailView } from "@/components/material-bundles/bundle-detail-view";

export default function BBundleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <BundleDetailView
      bundleId={id}
      variant="b"
      backHref="/dashboard"
    />
  );
}
