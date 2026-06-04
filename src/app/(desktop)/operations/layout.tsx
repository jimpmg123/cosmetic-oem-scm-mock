import { RoleRouteGuard } from "@/components/operations/role-route-guard";

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleRouteGuard>{children}</RoleRouteGuard>;
}
