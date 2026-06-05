import type { AAdminPolicy } from "@/lib/mock/a-admin-policy";
import type { MaterialBundle } from "@/lib/mock/material-bundles";
import type { UserRole } from "@/lib/mock/data";
import type { MaterialRequest } from "@/lib/mock/product-catalog";

export const A_PLANNING_ROLES: UserRole[] = ["super_admin"];
export const A_OPS_ROLES: UserRole[] = ["a_admin"];
export const A_DESKTOP_ROLES: UserRole[] = ["super_admin", "a_admin"];

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}

export function isAAdmin(role: UserRole): boolean {
  return role === "a_admin";
}

export function isAnyARole(role: UserRole): boolean {
  return role === "super_admin" || role === "a_admin";
}

export function canCreateVolume(role: UserRole): boolean {
  return role === "super_admin";
}

export function canEditBundle(
  role: UserRole,
  bundle: Pick<MaterialBundle, "status">,
): boolean {
  if (bundle.status === "closed") return false;
  if (role === "super_admin") return true;
  if (role === "a_admin") return bundle.status === "planned";
  return false;
}

export function canCloseBundle(role: UserRole): boolean {
  return role === "super_admin";
}

export function canIssueDirective(role: UserRole): boolean {
  return role === "super_admin";
}

export function requestApprovalQty(request: MaterialRequest): number {
  if (request.type === "b_production" && request.productionItems?.length) {
    return request.productionItems.reduce((sum, p) => sum + p.qty, 0);
  }
  if (request.type === "b_spot") {
    return request.lines.reduce((sum, l) => sum + l.qty, 0);
  }
  if (request.type === "a_push" && request.targetFinishedQty != null) {
    return request.targetFinishedQty;
  }
  return request.lines.reduce((sum, l) => sum + l.qty, 0);
}

export function canApproveMaterialRequest(
  role: UserRole,
  request: MaterialRequest,
  policy: AAdminPolicy,
): boolean {
  if (request.status !== "submitted") return false;
  if (request.type === "a_push") return false;
  if (role === "super_admin") return true;
  if (role !== "a_admin") return false;
  return requestApprovalQty(request) <= policy.autoApproveQtyThreshold;
}

export function canEditPushRequest(
  role: UserRole,
  request: MaterialRequest,
): boolean {
  if (request.type !== "a_push") return false;
  if (request.status === "approved" || request.status === "shipped" || request.status === "cancelled") {
    return false;
  }
  if (role === "super_admin") {
    return request.authorRole === "a_admin" && request.status === "draft";
  }
  if (role === "a_admin") {
    if (request.authorRole === "super_admin") return false;
    return request.authorRole === "a_admin" && request.status === "draft";
  }
  return false;
}

export function canPublishPushRequest(
  role: UserRole,
  request: MaterialRequest,
  policy: AAdminPolicy,
): boolean {
  if (request.type !== "a_push" || request.status !== "draft") return false;
  if (role === "super_admin") return true;
  if (role === "a_admin") {
    return (
      policy.adminCanPublishPush &&
      request.authorRole === "a_admin"
    );
  }
  return false;
}

export function canCreatePushNotice(role: UserRole): boolean {
  return isAnyARole(role);
}
