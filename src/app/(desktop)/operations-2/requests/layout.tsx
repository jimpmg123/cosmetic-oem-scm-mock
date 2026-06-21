import { ChinaSupplyStoreProvider } from "@/components/providers/china-supply-store-provider";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChinaSupplyStoreProvider>{children}</ChinaSupplyStoreProvider>;
}
