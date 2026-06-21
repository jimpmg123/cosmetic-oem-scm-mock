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
  | "b_admin_log_history"
  | "executive_overview"
  | "china_supply_korea"
  | "china_supply_inbound"
  | "china_supply_available_stock"
  | "china_supply_product_view"
  | "china_supply_issues"
  | "china_supply_audit"
  | "china_supply";

const ROUTE_RULES: { prefix: string; access: RouteAccess }[] = [
  { prefix: "/admin/settings", access: "super_only" },
  { prefix: "/operations-2/executive", access: "executive_overview" },
  { prefix: "/operations-2/catalog/inbound-view", access: "china_supply_product_view" },
  { prefix: "/operations-2/catalog", access: "china_supply_korea" },
  { prefix: "/operations-2/bom", access: "china_supply_korea" },
  { prefix: "/operations-2/requests", access: "china_supply_korea" },
  { prefix: "/operations-2/kolmar", access: "china_supply_korea" },
  { prefix: "/operations-2/manufacturers", access: "china_supply_korea" },
  { prefix: "/operations-2/inbound/available-stock", access: "china_supply_available_stock" },
  { prefix: "/operations-2/inbound", access: "china_supply_inbound" },
  { prefix: "/operations-2/analytics/yield-e2e", access: "china_supply_korea" },
  { prefix: "/operations-2/analytics/issues", access: "china_supply_issues" },
  { prefix: "/operations-2/analytics/audit", access: "china_supply_audit" },
  { prefix: "/operations-2", access: "china_supply" },
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
    case "executive_overview":
      return role === "executive";
    case "china_supply_korea":
      return role === "super_admin" || role === "a_admin";
    case "china_supply_inbound":
      return role === "super_admin" || role === "b_admin" || role === "b_staff";
    case "china_supply_available_stock":
      return role === "super_admin" || role === "b_admin";
    case "china_supply_product_view":
      return role === "super_admin" || role === "b_admin" || role === "b_staff";
    case "china_supply_issues":
      return role === "super_admin" || role === "a_admin" || role === "b_admin" || role === "b_staff";
    case "china_supply_audit":
      return role === "super_admin" || role === "a_admin" || role === "b_admin";
    case "china_supply":
      return role === "super_admin" || role === "a_admin" || role === "b_admin" || role === "b_staff";
    default:
      return true;
  }
}

function getChinaSupplyDefaultPathForRole(role: UserRole): string {
  switch (role) {
    case "executive":
      return "/operations-2/executive";
    case "b_admin":
    case "b_staff":
      return "/operations-2/inbound/inspection";
    case "super_admin":
    case "a_admin":
      return "/operations-2";
    case "warehouse":
      return "/m";
    default:
      return "/operations-2";
  }
}

export function getDefaultPathForRole(role: UserRole, pathname?: string): string {
  if (pathname?.startsWith("/operations-2")) {
    return getChinaSupplyDefaultPathForRole(role);
  }

  switch (role) {
    case "executive":
      return "/operations-2/executive";
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
