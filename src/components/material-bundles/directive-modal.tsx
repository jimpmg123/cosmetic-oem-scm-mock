"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, inputClassName } from "@/components/layout/page-parts";
import { useLocale } from "@/components/providers/locale-provider";
import type { MaterialBundle } from "@/lib/mock/material-bundles";

export function DirectiveModal({
  bundle,
  open,
  onClose,
  onSave,
}: {
  bundle: MaterialBundle | null;
  open: boolean;
  onClose: () => void;
  onSave: (input: {
    startDate: string;
    dueDate: string;
    targetQty: number;
    comment: string;
  }) => void;
}) {
  const { t } = useLocale();
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [comment, setComment] = useState("");

  if (!open || !bundle) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (dueDate < startDate) return;
    onSave({
      startDate,
      dueDate,
      targetQty: Number(targetQty) || 0,
      comment: comment.trim(),
    });
    setStartDate(today);
    setDueDate("");
    setTargetQty("");
    setComment("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-lg border border-scm-outline-variant bg-scm-surface-lowest p-6 shadow-lg"
        role="dialog"
        aria-modal
        aria-labelledby="directive-modal-title"
      >
        <h2 id="directive-modal-title" className="text-lg font-semibold text-scm-primary">
          {t("bundle.directive.title")}
        </h2>
        <p className="mt-1 text-sm text-scm-on-surface-variant">
          {bundle.number} · {bundle.productName}
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("bundle.directive.startDate")}>
              <input
                type="date"
                className={inputClassName}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </FormField>
            <FormField label={t("bundle.directive.dueDate")}>
              <input
                type="date"
                className={inputClassName}
                value={dueDate}
                min={startDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </FormField>
          </div>
          <FormField label={t("bundle.directive.targetQty")}>
            <input
              type="number"
              className={inputClassName}
              value={targetQty}
              onChange={(e) => setTargetQty(e.target.value)}
              required
              min={1}
            />
          </FormField>
          {startDate && dueDate && dueDate >= startDate && Number(targetQty) > 0 ? (
            <p className="text-xs text-scm-on-surface-variant">
              {t("bundle.directive.dailyPaceHint")}{" "}
              <strong className="tabular-nums text-scm-primary">
                {Math.ceil(
                  Number(targetQty) /
                    Math.max(
                      1,
                      Math.round(
                        (new Date(`${dueDate}T12:00:00`).getTime() -
                          new Date(`${startDate}T12:00:00`).getTime()) /
                          86_400_000,
                      ) + 1,
                    ),
                )}
              </strong>
            </p>
          ) : null}
          <FormField label={t("bundle.directive.comment")}>
            <textarea
              className={`${inputClassName} min-h-[80px] py-2`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("bundle.directive.commentPlaceholder")}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!dueDate || dueDate < startDate}>
              {t("bundle.directive.issue")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
