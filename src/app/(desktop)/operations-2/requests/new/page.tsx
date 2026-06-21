"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { inputClassName } from "@/components/layout/page-parts";
import { SearchBox } from "@/components/china-supply/search-box";
import { useRole } from "@/components/providers/role-provider";
import { useChinaSupplyStore } from "@/components/providers/china-supply-store-provider";
import { canCreateMfgRequest } from "@/lib/role-access";
import { searchProducts } from "@/lib/china-supply/search";
import { APPLICELL_PRODUCTS } from "@/lib/mock/china-supply/applicell-catalog";
import { COSMETIC_TYPE_LABELS, type CatalogProduct } from "@/lib/mock/product-catalog";
import type { McRequestLine } from "@/lib/mock/china-supply/manufacturing-requests";
import { cn } from "@/lib/utils";

function productMeta(p: CatalogProduct) {
  return [
    p.code,
    COSMETIC_TYPE_LABELS[p.cosmeticType],
    p.productVolume ? `${p.productVolume.value}${p.productVolume.unit}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function NewManufacturingRequestPage() {
  const router = useRouter();
  const { role } = useRole();
  const canCreate = canCreateMfgRequest(role);
  const { createRequest } = useChinaSupplyStore();

  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");

  const addedSet = useMemo(() => new Set(addedIds), [addedIds]);

  // 검색 결과(이미 담은 품목 제외)
  const results = useMemo(
    () => searchProducts(APPLICELL_PRODUCTS, search).filter((p) => !addedSet.has(p.id)),
    [search, addedSet],
  );

  const addedProducts = useMemo(
    () =>
      addedIds
        .map((id) => APPLICELL_PRODUCTS.find((p) => p.id === id))
        .filter((p): p is CatalogProduct => Boolean(p)),
    [addedIds],
  );

  const lines = useMemo<McRequestLine[]>(
    () =>
      addedProducts.flatMap((p) => {
        const qty = parseInt(qtys[p.id] ?? "", 10);
        if (!qty || qty <= 0) return [];
        return [{ productId: p.id, productName: p.name, productCode: p.code, qty }];
      }),
    [addedProducts, qtys],
  );

  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);
  const canSubmit = lines.length > 0 && dueDate.trim().length > 0;

  function addProduct(id: string) {
    setAddedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeProduct(id: string) {
    setAddedIds((prev) => prev.filter((x) => x !== id));
    setQtys((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function save(submit: boolean) {
    if (!canSubmit) return;
    createRequest({ lines, dueDate, comment: comment.trim() || undefined, actorRole: role, submit });
    router.push("/operations-2/requests");
  }

  if (!canCreate) {
    return <p className="text-sm text-scm-on-surface-variant">발주 작성 권한이 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-scm-on-surface-variant">
          <Link href="/operations-2/requests" className="font-medium text-scm-link">
            제조 요청
          </Link>
          <MaterialIcon name="chevron_right" className="text-[18px]" />
          <span>새 제조 요청</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-scm-primary">
          새 제조 요청 (발주서)
        </h1>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          제품을 검색해 발주 품목에 추가하고 수량을 입력하세요. 확정은 최고관리자가
          합니다.
        </p>
      </div>

      <DashboardCard title="제품 검색" subtitle="이름·SKU·바코드로 찾아 발주 품목에 추가">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="제품명 · SKU · 바코드 검색"
        />
        <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-scm-outline-variant/70">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-scm-on-surface-variant">
              {search ? "검색 결과가 없습니다." : "추가할 제품이 없습니다."}
            </p>
          ) : (
            <ul className="divide-y divide-scm-outline-variant/40">
              {results.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-scm-primary">{p.name}</p>
                    <p className="text-xs text-scm-on-surface-variant">{productMeta(p)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProduct(p.id)}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-2.5 text-xs font-medium text-scm-primary hover:bg-scm-surface-container"
                  >
                    <MaterialIcon name="add" className="text-[16px]" />
                    추가
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DashboardCard>

      <DashboardCard
        title={`발주 품목 (${addedProducts.length})`}
        subtitle="수량을 입력하세요 (0 또는 빈칸은 발주에서 제외)"
      >
        {addedProducts.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-scm-on-surface-variant">
            위에서 제품을 검색해 추가하세요.
          </p>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-scm-outline-variant/60 bg-[#F8F9FA] text-left text-[11px] font-semibold uppercase text-scm-on-surface-variant">
                  <th className="px-3 py-2.5">제품</th>
                  <th className="px-3 py-2.5 w-40 text-right">수량</th>
                  <th className="px-3 py-2.5 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {addedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-scm-outline-variant/40 last:border-0"
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-scm-primary">{p.name}</p>
                      <p className="text-xs text-scm-on-surface-variant">{productMeta(p)}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder="0"
                          value={qtys[p.id] ?? ""}
                          onChange={(e) =>
                            setQtys((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          className={cn(inputClassName, "w-28 text-right tabular-nums")}
                        />
                        <span className="text-xs text-scm-on-surface-variant">개</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeProduct(p.id)}
                        aria-label="품목 삭제"
                        className="rounded p-1 text-scm-on-surface-variant hover:bg-scm-surface-container-low hover:text-red-700"
                      >
                        <MaterialIcon name="delete" className="text-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-scm-outline-variant/70 font-semibold text-scm-primary">
                  <td className="px-3 py-2.5">총 발주 수량</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {totalQty.toLocaleString()} 개
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </DashboardCard>

      <DashboardCard title="발주 정보">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-scm-primary">납기일</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(inputClassName, "mt-1 w-full")}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-scm-primary">제조처</span>
            <input
              type="text"
              value="Kolmar (China) Co., Ltd."
              disabled
              className={cn(inputClassName, "mt-1 w-full bg-scm-surface-container-low")}
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-scm-primary">메모 (선택)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="발주 배경, 특이사항 등"
            className={cn(inputClassName, "mt-1 w-full")}
          />
        </label>
      </DashboardCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-scm-on-surface-variant">
          {canSubmit ? (
            <>
              <Badge variant="outline" className="mr-1 bg-white">
                {lines.length}품목
              </Badge>
              총 {totalQty.toLocaleString()}개 · 납기 {dueDate}
            </>
          ) : (
            "품목 수량과 납기일을 입력하면 저장할 수 있습니다."
          )}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/operations-2/requests"
            className="inline-flex h-9 items-center rounded-md border border-scm-outline-variant bg-white px-3 text-sm font-medium text-scm-primary hover:bg-scm-surface-container"
          >
            취소
          </Link>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={!canSubmit}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-scm-outline-variant bg-white px-3 text-sm font-medium text-scm-primary hover:bg-scm-surface-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MaterialIcon name="save" className="text-[18px]" />
            임시저장
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={!canSubmit}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-scm-secondary px-3 text-sm font-semibold text-white hover:bg-scm-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MaterialIcon name="send" className="text-[18px]" />
            작성 후 제출
          </button>
        </div>
      </div>
    </div>
  );
}
