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
  DEFAULT_YIELD_PCT,
  INITIAL_BRAND_LINES,
  INITIAL_CATALOG_PRODUCTS,
  INITIAL_MANUFACTURERS,
  INITIAL_MATERIAL_REQUESTS,
  calcProductionLines,
  nextRequestNumber,
  suggestProductCode,
  type BrandLine,
  type ManufacturingCompany,
  type CatalogProduct,
  type CosmeticType,
  type MaterialRequest,
  type MaterialRequestLine,
  type MaterialRequestType,
  type ProductBomLine,
  type ProductionRequestItem,
} from "@/lib/mock/product-catalog";

type CreateLineInput = {
  code: string;
  name: string;
  description?: string;
  imageUrl?: string;
  placedAt?: string;
  manufacturerId: string;
};

type CreateProductInput = {
  lineId: string;
  name: string;
  code?: string;
  cosmeticType: CosmeticType;
  devDate: string;
  imageUrl?: string;
  bom: Omit<ProductBomLine, "id">[];
  autoCode?: boolean;
};

type CatalogStoreValue = {
  manufacturers: ManufacturingCompany[];
  brandLines: BrandLine[];
  products: CatalogProduct[];
  materialRequests: MaterialRequest[];
  addBrandLine: (input: CreateLineInput) => string;
  updateBrandLine: (id: string, patch: Partial<BrandLine>) => void;
  addProduct: (input: CreateProductInput) => string;
  updateProduct: (id: string, patch: Partial<CatalogProduct>) => void;
  getLine: (id: string) => BrandLine | undefined;
  getProduct: (id: string) => CatalogProduct | undefined;
  submitMaterialRequest: (input: {
    type: MaterialRequestType;
    lines: MaterialRequestLine[];
    comment?: string;
    notifyMessage?: string;
    productionItems?: ProductionRequestItem[];
    createdBy: string;
    manufacturerId: string;
  }) => string;
  updateRequestStatus: (
    id: string,
    status: MaterialRequest["status"],
  ) => void;
};

const CatalogStoreContext = createContext<CatalogStoreValue | null>(null);

export function CatalogStoreProvider({ children }: { children: ReactNode }) {
  const [brandLines, setBrandLines] = useState(INITIAL_BRAND_LINES);
  const [products, setProducts] = useState(INITIAL_CATALOG_PRODUCTS);
  const [materialRequests, setMaterialRequests] = useState(
    INITIAL_MATERIAL_REQUESTS,
  );

  const addBrandLine = useCallback((input: CreateLineInput) => {
    const id = `line-${Date.now()}`;
    setBrandLines((prev) => [
      ...prev,
      {
        id,
        code: input.code.toUpperCase().replace(/\s+/g, ""),
        name: input.name,
        description: input.description,
        imageUrl: input.imageUrl,
        placedAt: input.placedAt ?? new Date().toISOString(),
        manufacturerId: input.manufacturerId,
      },
    ]);
    return id;
  }, []);

  const updateBrandLine = useCallback(
    (id: string, patch: Partial<BrandLine>) => {
      setBrandLines((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const next = { ...l, ...patch };
          if (patch.code != null) {
            next.code = patch.code.toUpperCase().replace(/\s+/g, "");
          }
          return next;
        }),
      );
    },
    [],
  );

  const addProduct = useCallback(
    (input: CreateProductInput) => {
      const line = brandLines.find((l) => l.id === input.lineId);
      const existingCodes = products.map((p) => p.code);
      const code =
        input.code?.trim() ||
        (input.autoCode !== false && line
          ? suggestProductCode(line.code, input.cosmeticType, existingCodes)
          : `PRD-${Date.now()}`);

      const id = `prod-${Date.now()}`;
      const now = new Date().toISOString();
      const bom: ProductBomLine[] = input.bom.map((b, i) => ({
        id: `bom-${id}-${i}`,
        ...b,
      }));

      setProducts((prev) => [
        ...prev,
        {
          id,
          lineId: input.lineId,
          name: input.name,
          code,
          cosmeticType: input.cosmeticType,
          devDate: input.devDate,
          imageUrl: input.imageUrl,
          bom,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      return id;
    },
    [brandLines, products],
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<CatalogProduct>) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...patch, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
    },
    [],
  );

  const getLine = useCallback(
    (id: string) => brandLines.find((l) => l.id === id),
    [brandLines],
  );

  const getProduct = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  const submitMaterialRequest = useCallback(
    (input: {
      type: MaterialRequestType;
      lines: MaterialRequestLine[];
      comment?: string;
      notifyMessage?: string;
      productionItems?: ProductionRequestItem[];
      createdBy: string;
      manufacturerId: string;
    }) => {
      const mfr = INITIAL_MANUFACTURERS.find(
        (m: ManufacturingCompany) => m.id === input.manufacturerId,
      );
      if (!mfr) throw new Error("Unknown manufacturer");
      const id = `req-${Date.now()}`;
      const number = nextRequestNumber(materialRequests);
      const row: MaterialRequest = {
        id,
        number,
        type: input.type,
        status: "submitted",
        createdAt: new Date().toISOString(),
        createdBy: input.createdBy,
        manufacturerId: mfr.id,
        manufacturerName: mfr.name,
        lines: input.lines,
        comment: input.comment,
        notifyMessage: input.notifyMessage,
        productionItems: input.productionItems,
        defaultYieldPct:
          input.type === "b_production" ? DEFAULT_YIELD_PCT : undefined,
      };
      setMaterialRequests((prev) => [row, ...prev]);
      return id;
    },
    [materialRequests],
  );

  const updateRequestStatus = useCallback(
    (id: string, status: MaterialRequest["status"]) => {
      setMaterialRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      manufacturers: INITIAL_MANUFACTURERS,
      brandLines,
      products,
      materialRequests,
      addBrandLine,
      updateBrandLine,
      addProduct,
      updateProduct,
      getLine,
      getProduct,
      submitMaterialRequest,
      updateRequestStatus,
    }),
    [
      brandLines,
      products,
      materialRequests,
      INITIAL_MANUFACTURERS,
      addBrandLine,
      updateBrandLine,
      addProduct,
      updateProduct,
      getLine,
      getProduct,
      submitMaterialRequest,
      updateRequestStatus,
    ],
  );

  return (
    <CatalogStoreContext.Provider value={value}>
      {children}
    </CatalogStoreContext.Provider>
  );
}

export function useCatalogStore() {
  const ctx = useContext(CatalogStoreContext);
  if (!ctx) {
    throw new Error("useCatalogStore must be used within CatalogStoreProvider");
  }
  return ctx;
}

export { calcProductionLines, DEFAULT_YIELD_PCT, MAX_YIELD_PCT } from "@/lib/mock/product-catalog";
