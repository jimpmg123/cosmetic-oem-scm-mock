import { RoleRouteGuard } from "@/components/operations/role-route-guard";

export default function Operations2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleRouteGuard>{children}</RoleRouteGuard>;
}
