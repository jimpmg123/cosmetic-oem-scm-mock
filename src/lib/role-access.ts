import type { UserRole } from "@/lib/mock/data";

/** A·B Admin이 함께 보는 운영(조회) 화면 */
export const ADMIN_OVERSIGHT_ROLES: UserRole[] = ["super_admin", "a_admin", "b_admin"];

/** B 현장 입력 (Staff) */
export const B_FIELD_INPUT_ROLES: UserRole[] = ["b_staff"];

/** B Admin 전용 입력 (입고·출하) */
export const B_ADMIN_INPUT_ROLES: UserRole[] = ["b_admin"];

export type RouteAccess =
  | "all_desktop"
  | "admin_oversight"
  | "a_planning"
  | "a_desktop"
  | "a_ops_only"
  | "super_only"
  | "b_admin_board"
  | "b_staff_daily_log"
  | "b_admin_receipt"
  | "b_admin_shipments"
  | "b_calendar"
  | "b_admin_log_history";

const ROUTE_RULES: { prefix: string; access: RouteAccess }[] = [
  { prefix: "/admin/settings", access: "super_only" },
  { prefix: "/operations/daily-log/history", access: "b_admin_log_history" },
  { prefix: "/operations/daily-log", access: "b_staff_daily_log" },
  { prefix: "/operations/material-bundles/new", access: "a_planning" },
  { prefix: "/operations/material-requests/inbox", access: "a_desktop" },
  { prefix: "/operations/material-push", access: "a_desktop" },
  { prefix: "/operations/catalog", access: "a_planning" },
  { prefix: "/operations/material-requests/production", access: "b_admin_receipt" },
  { prefix: "/operations/material-requests/spot", access: "b_admin_receipt" },
  { prefix: "/operations/material-requests", access: "b_admin_receipt" },
  { prefix: "/operations/material-receipt", access: "b_admin_receipt" },
  { prefix: "/operations/shipments", access: "b_admin_shipments" },
  { prefix: "/operations/production-calendar", access: "b_calendar" },
  { prefix: "/operations/yield-overview", access: "a_desktop" },
  { prefix: "/operations/command-center", access: "a_desktop" },
  { prefix: "/operations/product-lines", access: "a_planning" },
  { prefix: "/operations/material-shipment", access: "a_ops_only" },
  { prefix: "/operations/transit-reconciliation", access: "a_desktop" },
  { prefix: "/operations/directives", access: "a_planning" },
  { prefix: "/operations/exceptions", access: "a_planning" },
  { prefix: "/operations/directive-analytics", access: "a_planning" },
  { prefix: "/operations/material-bundles", access: "a_desktop" },
  { prefix: "/operations/bundles", access: "b_admin_board" },
  { prefix: "/operations/production", access: "b_staff_daily_log" },
  { prefix: "/operations/reconciliation", access: "admin_oversight" },
  { prefix: "/dashboard", access: "admin_oversight" },
];

function matchRule(pathname: string) {
  return ROUTE_RULES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (role === "warehouse") return false;
  const rule = matchRule(pathname);
  if (!rule) return true;

  switch (rule.access) {
    case "admin_oversight":
      return ADMIN_OVERSIGHT_ROLES.includes(role);
    case "super_only":
    case "a_planning":
      return role === "super_admin";
    case "a_desktop":
      return role === "super_admin" || role === "a_admin";
    case "a_ops_only":
      return role === "super_admin" || role === "a_admin";
    case "b_admin_board":
      return role === "b_admin" || role === "super_admin" || role === "a_admin";
    case "b_staff_daily_log":
      return B_FIELD_INPUT_ROLES.includes(role);
    case "b_admin_receipt":
    case "b_admin_shipments":
    case "b_admin_log_history":
      return role === "b_admin";
    case "b_calendar":
      return ADMIN_OVERSIGHT_ROLES.includes(role) || B_FIELD_INPUT_ROLES.includes(role);
    default:
      return true;
  }
}

export function getDefaultPathForRole(role: UserRole): string {
  switch (role) {
    case "a_admin":
      return "/operations/material-shipment";
    case "b_staff":
      return "/operations/daily-log";
    case "b_admin":
      return "/operations/bundles";
    case "warehouse":
      return "/m";
    default:
      return "/operations/yield-overview";
  }
}

export function canUseDailyLogForm(role: UserRole): boolean {
  return B_FIELD_INPUT_ROLES.includes(role);
}

export function canUseBAdminInput(role: UserRole): boolean {
  return role === "b_admin";
}

export function isAdminOversight(role: UserRole): boolean {
  return ADMIN_OVERSIGHT_ROLES.includes(role);
}

export function canSeeStaffInputUi(role: UserRole): boolean {
  return B_FIELD_INPUT_ROLES.includes(role);
}
