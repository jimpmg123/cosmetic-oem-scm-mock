import { DesktopShell } from "@/components/layout/desktop-shell";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopShell>{children}</DesktopShell>;
}
