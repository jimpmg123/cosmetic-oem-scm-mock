"use client";

import { use } from "react";
import { BundleDetailView } from "@/components/material-bundles/bundle-detail-view";

export default function MaterialBundleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <BundleDetailView
      bundleId={id}
      variant="a"
      backHref="/operations/material-bundles"
    />
  );
}
