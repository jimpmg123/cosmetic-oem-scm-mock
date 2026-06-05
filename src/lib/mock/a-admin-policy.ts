/** A Super Admin → A Admin 위임 정책 (mock, 세션 저장) */

export type AAdminPolicy = {
  /** Admin이 통지 출하 draft를 직접 발행(통지)할 수 있는지 */
  adminCanPublishPush: boolean;
  /** B 재료 요청 자동 승인 한도 (완제품 개수 합). 초과 시 Super만 승인 */
  autoApproveQtyThreshold: number;
};

export const DEFAULT_A_ADMIN_POLICY: AAdminPolicy = {
  adminCanPublishPush: false,
  autoApproveQtyThreshold: 500,
};
