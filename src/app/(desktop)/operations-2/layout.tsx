import { RoleRouteGuard } from "@/components/operations/role-route-guard";
import { ChinaSupplyStoreProvider } from "@/components/providers/china-supply-store-provider";

export default function Operations2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChinaSupplyStoreProvider>
      <RoleRouteGuard>{children}</RoleRouteGuard>
    </ChinaSupplyStoreProvider>
  );
}
