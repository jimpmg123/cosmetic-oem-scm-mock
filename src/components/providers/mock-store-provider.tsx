"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_INBOUND_SHIPMENTS,
  INITIAL_PRODUCTION_ENTRIES,
  INITIAL_WORK_ORDERS,
  type InboundShipment,
  type ProductionEntry,
  type WorkOrder,
  type WoStatus,
} from "@/lib/mock/data";
import {
  buildDirectiveAnalytics,
  recomputeBundleTotals,
  type DirectiveAnalytics,
} from "@/lib/mock/analytics";
import {
  INITIAL_BUNDLE_SHIPMENTS,
  INITIAL_DAILY_LOGS,
  INITIAL_DIRECTIVES,
  INITIAL_MATERIAL_BUNDLES,
  INITIAL_MATERIAL_RECEIPTS,
  INITIAL_RECEIPT_AUDITS,
  nextBundleNumber,
  SKU_OPTIONS,
  VENDORS,
  type BundleShipmentToC,
  type DailyProductionLog,
  type MaterialBundle,
  type MaterialReceipt,
  type MaterialReceiptAudit,
  type PeriodDirective,
} from "@/lib/mock/material-bundles";

type CreateBundleInput = {
  sku: string;
  theoreticalQty: number;
  targetQty: number;
  useFromDate?: string;
  useByDate: string;
  vendorId: string;
  poWoRef?: string;
  internalNote?: string;
  materialShipQty?: number;
  shippedAt?: string;
  activate?: boolean;
};

type MockStoreContextValue = {
  workOrders: WorkOrder[];
  inboundShipments: InboundShipment[];
  productionEntries: ProductionEntry[];
  materialBundles: MaterialBundle[];
  directives: PeriodDirective[];
  dailyLogs: DailyProductionLog[];
  bundleShipments: BundleShipmentToC[];
  materialReceipts: MaterialReceipt[];
  receiptAudits: MaterialReceiptAudit[];
  addWorkOrder: (
    input: Omit<
      WorkOrder,
      | "id"
      | "number"
      | "status"
      | "bClaimedQty"
      | "bShippedQty"
      | "cReceivedQty"
      | "materialShipQty"
      | "yieldAllowancePct"
    > & { targetQty: number },
  ) => void;
  deleteWorkOrder: (id: string) => void;
  addProductionEntry: (input: {
    woId: string;
    qty: number;
    scrap: number;
    note?: string;
  }) => void;
  deleteProductionEntry: (id: string) => void;
  saveInboundReceiving: (shipmentId: string, receivedQty: number) => void;
  getWorkOrder: (id: string) => WorkOrder | undefined;
  getShipment: (id: string) => InboundShipment | undefined;
  getMaterialBundle: (id: string) => MaterialBundle | undefined;
  createMaterialBundle: (input: CreateBundleInput) => string;
  updateMaterialBundle: (
    id: string,
    patch: Partial<MaterialBundle>,
  ) => void;
  markBundleShipped: (id: string) => void;
  markBundleDepleted: (id: string) => void;
  closeMaterialBundle: (id: string) => void;
  addDirective: (input: {
    bundleId: string;
    startDate: string;
    dueDate: string;
    targetQty: number;
    comment?: string;
  }) => void;
  getDirectivesForBundle: (bundleId: string) => PeriodDirective[];
  getDailyLogsForBundle: (bundleId: string) => DailyProductionLog[];
  getShipmentsForBundle: (bundleId: string) => BundleShipmentToC[];
  saveDailyLog: (input: {
    bundleId: string;
    date: string;
    producedQty: number;
    defectQty: number;
    qcSampleQty?: number;
    note?: string;
  }) => void;
  getMaterialReceipt: (bundleId: string) => MaterialReceipt | undefined;
  getReceiptAudits: (bundleId: string) => MaterialReceiptAudit[];
  saveMaterialReceipt: (
    bundleId: string,
    bConfirmedQty: number,
    comment: string,
  ) => void;
  getDirectiveAnalytics: (directiveId: string) => DirectiveAnalytics | null;
  addBundleShipment: (input: {
    bundleId: string;
    shippedQty: number;
    shippedAt: string;
  }) => void;
  updateBundleShipmentReceived: (
    shipmentId: string,
    receivedQty: number,
  ) => void;
  isBundleAtRiskReceipt: (bundleId: string) => boolean;
};

const MockStoreContext = createContext<MockStoreContextValue | null>(null);

function nextWoNumber(existing: WorkOrder[]): string {
  const n =
    Math.max(
      0,
      ...existing.map((w) => {
        const m = w.number.match(/WO-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      }),
    ) + 1;
  return `WO-2026-${String(n).padStart(3, "0")}`;
}

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [workOrders, setWorkOrders] = useState(INITIAL_WORK_ORDERS);
  const [inboundShipments, setInboundShipments] = useState(
    INITIAL_INBOUND_SHIPMENTS,
  );
  const [productionEntries, setProductionEntries] = useState(
    INITIAL_PRODUCTION_ENTRIES,
  );
  const [materialBundles, setMaterialBundles] = useState(
    INITIAL_MATERIAL_BUNDLES,
  );
  const [directives, setDirectives] = useState(INITIAL_DIRECTIVES);
  const [dailyLogs, setDailyLogs] = useState(INITIAL_DAILY_LOGS);
  const [bundleShipments, setBundleShipments] = useState(INITIAL_BUNDLE_SHIPMENTS);
  const [materialReceipts, setMaterialReceipts] = useState(
    INITIAL_MATERIAL_RECEIPTS,
  );
  const [receiptAudits, setReceiptAudits] = useState(INITIAL_RECEIPT_AUDITS);

  const addWorkOrder = useCallback(
    (input: {
      sku: string;
      productName: string;
      targetQty: number;
      vendor: string;
    }) => {
      setWorkOrders((prev) => {
        const number = nextWoNumber(prev);
        const materialShipQty = Math.ceil(input.targetQty * 1.09);
        const wo: WorkOrder = {
          id: `wo-${Date.now()}`,
          number,
          sku: input.sku,
          productName: input.productName,
          targetQty: input.targetQty,
          materialShipQty,
          yieldAllowancePct: 9,
          bClaimedQty: null,
          bShippedQty: null,
          cReceivedQty: null,
          status: "planned" as WoStatus,
          vendor: input.vendor,
        };
        return [...prev, wo];
      });
    },
    [],
  );

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders((prev) => prev.filter((w) => w.id !== id));
    setProductionEntries((prev) => prev.filter((e) => e.woId !== id));
  }, []);

  const addProductionEntry = useCallback(
    (input: { woId: string; qty: number; scrap: number; note?: string }) => {
      const entry: ProductionEntry = {
        id: `pe-${Date.now()}`,
        woId: input.woId,
        qty: input.qty,
        scrap: input.scrap,
        note: input.note ?? "",
        createdAt: new Date().toISOString(),
      };
      setProductionEntries((prev) => {
        const next = [...prev, entry];
        setWorkOrders((wos) =>
          wos.map((wo) => {
            if (wo.id !== input.woId) return wo;
            const total = next
              .filter((e) => e.woId === input.woId)
              .reduce((s, e) => s + e.qty, 0);
            return {
              ...wo,
              bClaimedQty: total,
              status: "produced" as WoStatus,
            };
          }),
        );
        return next;
      });
    },
    [],
  );

  const deleteProductionEntry = useCallback((id: string) => {
    setProductionEntries((prev) => {
      const removed = prev.find((e) => e.id === id);
      const next = prev.filter((e) => e.id !== id);
      if (removed) {
        setWorkOrders((wos) =>
          wos.map((wo) => {
            if (wo.id !== removed.woId) return wo;
            const total = next
              .filter((e) => e.woId === removed.woId)
              .reduce((s, e) => s + e.qty, 0);
            return {
              ...wo,
              bClaimedQty: total > 0 ? total : null,
              status:
                total > 0 ? ("produced" as WoStatus) : ("planned" as WoStatus),
            };
          }),
        );
      }
      return next;
    });
  }, []);

  const saveInboundReceiving = useCallback(
    (shipmentId: string, receivedQty: number) => {
      setInboundShipments((prev) => {
        const shp = prev.find((s) => s.id === shipmentId);
        if (shp) {
          setWorkOrders((wos) =>
            wos.map((wo) =>
              wo.number === shp.woNumber
                ? {
                    ...wo,
                    cReceivedQty: receivedQty,
                    bShippedQty: shp.expectedQty,
                    status: "closed" as WoStatus,
                  }
                : wo,
            ),
          );
        }
        return prev.map((s) =>
          s.id === shipmentId
            ? { ...s, receivedQty, status: "closed" as const }
            : s,
        );
      });
    },
    [],
  );

  const getWorkOrder = useCallback(
    (id: string) => workOrders.find((w) => w.id === id),
    [workOrders],
  );

  const getShipment = useCallback(
    (id: string) => inboundShipments.find((s) => s.id === id),
    [inboundShipments],
  );

  const getMaterialBundle = useCallback(
    (id: string) => materialBundles.find((b) => b.id === id),
    [materialBundles],
  );

  const createMaterialBundle = useCallback(
    (input: CreateBundleInput) => {
      const skuMeta = SKU_OPTIONS.find((s) => s.sku === input.sku);
      const vendor = VENDORS.find((v) => v.id === input.vendorId);
      const id = `mb-${Date.now()}`;
      let newId = id;
      setMaterialBundles((prev) => {
        const number = nextBundleNumber(prev);
        const bundle: MaterialBundle = {
          id,
          number,
          sku: input.sku,
          productName: skuMeta?.productName ?? input.sku,
          theoreticalQty: input.theoreticalQty,
          targetQty: input.targetQty,
          useFromDate: input.useFromDate,
          useByDate: input.useByDate,
          vendorId: input.vendorId,
          vendorName: vendor?.name ?? input.vendorId,
          poWoRef: input.poWoRef,
          internalNote: input.internalNote,
          materialShipQty: input.materialShipQty,
          shippedAt: input.shippedAt,
          status: input.activate ? "active" : "planned",
          producedTotal: 0,
          shippedToCTotal: 0,
          receivedAtCTotal: 0,
          createdAt: new Date().toISOString(),
          createdBy: "Super Admin",
        };
        newId = bundle.id;
        return [...prev, bundle];
      });
      return newId;
    },
    [],
  );

  const updateMaterialBundle = useCallback(
    (id: string, patch: Partial<MaterialBundle>) => {
      setMaterialBundles((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      );
    },
    [],
  );

  const markBundleShipped = useCallback((id: string) => {
    setMaterialBundles((prev) =>
      prev.map((b) =>
        b.id === id && b.status === "planned"
          ? { ...b, status: "active" as const }
          : b,
      ),
    );
  }, []);

  const markBundleDepleted = useCallback((id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setMaterialBundles((prev) =>
      prev.map((b) =>
        b.id === id && b.status === "active"
          ? { ...b, status: "depleted" as const, depletedAt: today }
          : b,
      ),
    );
  }, []);

  const closeMaterialBundle = useCallback((id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setMaterialBundles((prev) =>
      prev.map((b) =>
        b.id === id && (b.status === "active" || b.status === "depleted")
          ? { ...b, status: "closed" as const, closedAt: today }
          : b,
      ),
    );
  }, []);

  const addDirective = useCallback(
    (input: {
      bundleId: string;
      startDate: string;
      dueDate: string;
      targetQty: number;
      comment?: string;
    }) => {
      const directive: PeriodDirective = {
        id: `dir-${Date.now()}`,
        bundleId: input.bundleId,
        dueDate: input.dueDate,
        targetQty: input.targetQty,
        comment: input.comment,
        status: "issued",
        issuedAt: input.startDate,
        issuedBy: "Super Admin",
      };
      setDirectives((prev) => [...prev, directive]);
    },
    [],
  );

  const getDirectivesForBundle = useCallback(
    (bundleId: string) =>
      directives
        .filter((d) => d.bundleId === bundleId)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [directives],
  );

  const getDailyLogsForBundle = useCallback(
    (bundleId: string) =>
      dailyLogs
        .filter((l) => l.bundleId === bundleId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [dailyLogs],
  );

  const getShipmentsForBundle = useCallback(
    (bundleId: string) =>
      bundleShipments
        .filter((s) => s.bundleId === bundleId)
        .sort((a, b) => b.shippedAt.localeCompare(a.shippedAt)),
    [bundleShipments],
  );

  const saveDailyLog = useCallback(
    (input: {
      bundleId: string;
      date: string;
      producedQty: number;
      defectQty: number;
      qcSampleQty?: number;
      note?: string;
    }) => {
      setDailyLogs((prev) => {
        const idx = prev.findIndex(
          (l) => l.bundleId === input.bundleId && l.date === input.date,
        );
        const row: DailyProductionLog = {
          id: idx >= 0 ? prev[idx].id : `log-${Date.now()}`,
          bundleId: input.bundleId,
          date: input.date,
          producedQty: input.producedQty,
          defectQty: input.defectQty,
          qcSampleQty: input.qcSampleQty ?? 0,
          note: input.note,
          status: "submitted",
        };
        const next =
          idx >= 0
            ? prev.map((l, i) => (i === idx ? row : l))
            : [...prev, row];
        setBundleShipments((ships) => {
          const totals = recomputeBundleTotals(input.bundleId, next, ships);
          setMaterialBundles((bundles) =>
            bundles.map((b) =>
              b.id === input.bundleId ? { ...b, ...totals } : b,
            ),
          );
          return ships;
        });
        return next;
      });
    },
    [],
  );

  const getMaterialReceipt = useCallback(
    (bundleId: string) => materialReceipts.find((r) => r.bundleId === bundleId),
    [materialReceipts],
  );

  const getReceiptAudits = useCallback(
    (bundleId: string) =>
      receiptAudits
        .filter((a) => a.bundleId === bundleId)
        .sort((a, b) => b.changedAt.localeCompare(a.changedAt)),
    [receiptAudits],
  );

  const saveMaterialReceipt = useCallback(
    (bundleId: string, bConfirmedQty: number, comment: string) => {
      if (!comment.trim()) return;
      setMaterialReceipts((prev) => {
        const existing = prev.find((r) => r.bundleId === bundleId);
        const bundle = materialBundles.find((b) => b.id === bundleId);
        const aShipped = existing?.aShippedQty ?? bundle?.materialShipQty ?? 0;
        const row: MaterialReceipt = {
          bundleId,
          aShippedQty: aShipped,
          bConfirmedQty,
          status:
            bConfirmedQty === aShipped
              ? "matched"
              : "disputed",
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        const audit: MaterialReceiptAudit = {
          id: `ra-${Date.now()}`,
          bundleId,
          action: existing?.bConfirmedQty != null ? "updated" : "created",
          previousQty: existing?.bConfirmedQty ?? null,
          newQty: bConfirmedQty,
          comment: comment.trim(),
          changedBy: "B Admin",
          changedAt: new Date().toISOString(),
        };
        setReceiptAudits((aud) => [...aud, audit]);
        if (existing) {
          return prev.map((r) => (r.bundleId === bundleId ? row : r));
        }
        return [...prev, row];
      });
    },
    [materialBundles],
  );

  const getDirectiveAnalytics = useCallback(
    (directiveId: string) => {
      const directive = directives.find((d) => d.id === directiveId);
      if (!directive) return null;
      return buildDirectiveAnalytics(directive, dailyLogs, bundleShipments);
    },
    [directives, dailyLogs, bundleShipments],
  );

  const addBundleShipment = useCallback(
    (input: { bundleId: string; shippedQty: number; shippedAt: string }) => {
      const shp: BundleShipmentToC = {
        id: `bshp-${Date.now()}`,
        bundleId: input.bundleId,
        number: `SHP-MB-${String(Date.now()).slice(-4)}`,
        shippedQty: input.shippedQty,
        receivedQty: null,
        shippedAt: input.shippedAt,
      };
      setBundleShipments((prev) => {
        const next = [...prev, shp];
        const totals = recomputeBundleTotals(input.bundleId, dailyLogs, next);
        setMaterialBundles((bundles) =>
          bundles.map((b) =>
            b.id === input.bundleId ? { ...b, ...totals } : b,
          ),
        );
        return next;
      });
    },
    [dailyLogs],
  );

  const updateBundleShipmentReceived = useCallback(
    (shipmentId: string, receivedQty: number) => {
      setBundleShipments((prev) => {
        const shp = prev.find((s) => s.id === shipmentId);
        if (!shp) return prev;
        const next = prev.map((s) =>
          s.id === shipmentId ? { ...s, receivedQty } : s,
        );
        const totals = recomputeBundleTotals(shp.bundleId, dailyLogs, next);
        setMaterialBundles((bundles) =>
          bundles.map((b) =>
            b.id === shp.bundleId ? { ...b, ...totals } : b,
          ),
        );
        return next;
      });
    },
    [dailyLogs],
  );

  const isBundleAtRiskReceipt = useCallback(
    (bundleId: string) => {
      const bundle = materialBundles.find((b) => b.id === bundleId);
      if (!bundle || bundle.status !== "active") return false;
      const receipt = materialReceipts.find((r) => r.bundleId === bundleId);
      return !receipt || receipt.bConfirmedQty == null;
    },
    [materialBundles, materialReceipts],
  );

  const value = useMemo(
    () => ({
      workOrders,
      inboundShipments,
      productionEntries,
      materialBundles,
      directives,
      dailyLogs,
      bundleShipments,
      materialReceipts,
      receiptAudits,
      addWorkOrder,
      deleteWorkOrder,
      addProductionEntry,
      deleteProductionEntry,
      saveInboundReceiving,
      getWorkOrder,
      getShipment,
      getMaterialBundle,
      createMaterialBundle,
      updateMaterialBundle,
      markBundleShipped,
      markBundleDepleted,
      closeMaterialBundle,
      addDirective,
      getDirectivesForBundle,
      getDailyLogsForBundle,
      getShipmentsForBundle,
      saveDailyLog,
      getMaterialReceipt,
      getReceiptAudits,
      saveMaterialReceipt,
      getDirectiveAnalytics,
      addBundleShipment,
      updateBundleShipmentReceived,
      isBundleAtRiskReceipt,
    }),
    [
      workOrders,
      inboundShipments,
      productionEntries,
      materialBundles,
      directives,
      dailyLogs,
      bundleShipments,
      materialReceipts,
      receiptAudits,
      addWorkOrder,
      deleteWorkOrder,
      addProductionEntry,
      deleteProductionEntry,
      saveInboundReceiving,
      getWorkOrder,
      getShipment,
      getMaterialBundle,
      createMaterialBundle,
      updateMaterialBundle,
      markBundleShipped,
      markBundleDepleted,
      closeMaterialBundle,
      addDirective,
      getDirectivesForBundle,
      getDailyLogsForBundle,
      getShipmentsForBundle,
      saveDailyLog,
      getMaterialReceipt,
      getReceiptAudits,
      saveMaterialReceipt,
      getDirectiveAnalytics,
      addBundleShipment,
      updateBundleShipmentReceived,
      isBundleAtRiskReceipt,
    ],
  );

  return (
    <MockStoreContext.Provider value={value}>
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error("useMockStore must be used within MockStoreProvider");
  return ctx;
}
