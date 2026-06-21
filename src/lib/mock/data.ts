export type UserRole =
  | "executive"
  | "super_admin"
  | "a_admin"
  | "b_admin"
  | "b_staff"
  | "warehouse";

export type WoStatus =
  | "planned"
  | "in_production"
  | "produced"
  | "shipped"
  | "receiving"
  | "closed";

export type ShipmentStatus = "in_transit" | "receiving" | "closed";

export interface WorkOrder {
  id: string;
  number: string;
  sku: string;
  productName: string;
  targetQty: number;
  materialShipQty: number;
  yieldAllowancePct: number;
  bClaimedQty: number | null;
  bShippedQty: number | null;
  cReceivedQty: number | null;
  status: WoStatus;
  vendor: string;
}

export interface InboundShipment {
  id: string;
  number: string;
  woNumber: string;
  sku: string;
  expectedQty: number;
  receivedQty: number | null;
  status: ShipmentStatus;
  qrCode: string;
}

export interface ProductionEntry {
  id: string;
  woId: string;
  qty: number;
  scrap: number;
  note: string;
  createdAt: string;
}

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: "wo-2026-001",
    number: "WO-2026-001",
    sku: "SERUM-50",
    productName: "Hydrating Serum 50ml",
    targetQty: 1100,
    materialShipQty: 1200,
    yieldAllowancePct: 9.1,
    bClaimedQty: 1095,
    bShippedQty: 1095,
    cReceivedQty: 1088,
    status: "receiving",
    vendor: "B Cosmetics (CN)",
  },
  {
    id: "wo-2026-002",
    number: "WO-2026-002",
    sku: "TONER-100",
    productName: "Calming Toner 100ml",
    targetQty: 800,
    materialShipQty: 872,
    yieldAllowancePct: 9,
    bClaimedQty: null,
    bShippedQty: null,
    cReceivedQty: null,
    status: "planned",
    vendor: "B Cosmetics (CN)",
  },
  {
    id: "wo-2026-003",
    number: "WO-2026-003",
    sku: "LOTION-250",
    productName: "Moisture Lotion 250ml",
    targetQty: 5000,
    materialShipQty: 5450,
    yieldAllowancePct: 9,
    bClaimedQty: 4992,
    bShippedQty: 4992,
    cReceivedQty: 4990,
    status: "closed",
    vendor: "B Cosmetics (CN)",
  },
];

export const INITIAL_INBOUND_SHIPMENTS: InboundShipment[] = [
  {
    id: "shp-001",
    number: "SHP-2026-001",
    woNumber: "WO-2026-001",
    sku: "SERUM-50",
    expectedQty: 1095,
    receivedQty: null,
    status: "receiving",
    qrCode: "QR-SHP-2026-001",
  },
  {
    id: "shp-002",
    number: "SHP-2026-002",
    woNumber: "WO-2026-002",
    sku: "TONER-100",
    expectedQty: 800,
    receivedQty: 800,
    status: "closed",
    qrCode: "QR-SHP-2026-002",
  },
];

export const INITIAL_PRODUCTION_ENTRIES: ProductionEntry[] = [
  {
    id: "pe-001",
    woId: "wo-2026-001",
    qty: 1095,
    scrap: 5,
    note: "Batch A",
    createdAt: "2026-06-01T10:00:00Z",
  },
];

export function calcProductionYield(wo: WorkOrder): number | null {
  if (wo.bClaimedQty == null) return null;
  return (wo.bClaimedQty / wo.targetQty) * 100;
}

export function calcEndToEndYield(wo: WorkOrder): number | null {
  if (wo.cReceivedQty == null) return null;
  return (wo.cReceivedQty / wo.targetQty) * 100;
}

export function calcInboundDiscrepancy(wo: WorkOrder): number | null {
  if (wo.cReceivedQty == null || wo.bShippedQty == null) return null;
  return wo.cReceivedQty - wo.bShippedQty;
}
