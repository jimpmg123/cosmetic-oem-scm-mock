import type { UserRole } from "@/lib/mock/data";

export type NavSectionId = "common" | "role" | "admin";

export type NavGroupId =
  | "aMaster"
  | "aBundles"
  | "aMaterials"
  | "aDirectives"
  | "aInsights"
  | "aPartner"
  | "bProduction"
  | "bMaterials"
  | "erp"
  | "admin";

export type NavItem = {
  labelKey: string;
  href: string;
  icon: string;
  roles: UserRole[];
  section: NavSectionId;
  groupId?: NavGroupId;
  /** 목록 링크가 /new 하위 경로까지 active 되지 않게 */
  excludeChildPaths?: string[];
};

export type NavGroupDef = {
  id: NavGroupId;
  labelKey: string;
  icon: string;
  section: NavSectionId;
  defaultOpen?: boolean;
  order: number;
};

export type NavSectionConfig = {
  id: NavSectionId;
  titleKey: string;
  icon: string;
  pinned?: boolean;
};

export const NAV_SECTIONS: NavSectionConfig[] = [
  { id: "common", titleKey: "nav.section.common", icon: "hub" },
  { id: "role", titleKey: "nav.section.role", icon: "badge" },
  { id: "admin", titleKey: "nav.section.system", icon: "settings", pinned: true },
];

export const NAV_GROUPS: NavGroupDef[] = [
  { id: "aMaster", labelKey: "nav.group.aMaster", icon: "category", section: "common", order: 10 },
  {
    id: "aBundles",
    labelKey: "nav.group.aBundles",
    icon: "inventory",
    section: "common",
    defaultOpen: true,
    order: 20,
  },
  {
    id: "aMaterials",
    labelKey: "nav.group.aMaterials",
    icon: "local_shipping",
    section: "common",
    order: 30,
  },
  {
    id: "aDirectives",
    labelKey: "nav.group.aDirectives",
    icon: "event_note",
    section: "common",
    order: 40,
  },
  {
    id: "aInsights",
    labelKey: "nav.group.aInsights",
    icon: "analytics",
    section: "common",
    order: 50,
  },
  {
    id: "aPartner",
    labelKey: "nav.group.aPartner",
    icon: "factory",
    section: "common",
    order: 60,
  },
  {
    id: "bProduction",
    labelKey: "nav.group.bProduction",
    icon: "precision_manufacturing",
    section: "role",
    defaultOpen: true,
    order: 10,
  },
  {
    id: "bMaterials",
    labelKey: "nav.group.bMaterials",
    icon: "inventory_2",
    section: "role",
    order: 20,
  },
  { id: "erp", labelKey: "nav.group.erp", icon: "account_tree", section: "role", order: 90 },
  { id: "admin", labelKey: "nav.group.admin", icon: "settings", section: "admin", order: 10 },
];

export const NAV_ITEMS: NavItem[] = [
  {
    labelKey: "nav.yieldOverview",
    href: "/operations/yield-overview",
    icon: "trending_up",
    roles: ["super_admin"],
    section: "common",
  },
  {
    labelKey: "nav.commandCenter",
    href: "/operations/command-center",
    icon: "monitoring",
    roles: ["super_admin"],
    section: "common",
  },
  {
    labelKey: "nav.catalogHub",
    href: "/operations/catalog",
    icon: "category",
    roles: ["super_admin"],
    section: "common",
    groupId: "aMaster",
    excludeChildPaths: ["/operations/catalog/products/new"],
  },
  {
    labelKey: "nav.catalogProductNew",
    href: "/operations/catalog/products/new",
    icon: "add_circle",
    roles: ["super_admin"],
    section: "common",
    groupId: "aMaster",
  },
  {
    labelKey: "nav.materialBundlesList",
    href: "/operations/material-bundles",
    icon: "list_alt",
    roles: ["super_admin"],
    section: "common",
    groupId: "aBundles",
    excludeChildPaths: ["/operations/material-bundles/new"],
  },
  {
    labelKey: "nav.materialBundlesNew",
    href: "/operations/material-bundles/new",
    icon: "add_circle",
    roles: ["super_admin"],
    section: "common",
    groupId: "aBundles",
  },
  {
    labelKey: "nav.materialPush",
    href: "/operations/material-push",
    icon: "campaign",
    roles: ["super_admin"],
    section: "common",
    groupId: "aMaterials",
  },
  {
    labelKey: "nav.materialRequestInbox",
    href: "/operations/material-requests/inbox",
    icon: "inbox",
    roles: ["super_admin"],
    section: "common",
    groupId: "aMaterials",
  },
  {
    labelKey: "nav.aRawShipment",
    href: "/operations/material-shipment",
    icon: "local_shipping",
    roles: ["super_admin"],
    section: "common",
    groupId: "aMaterials",
  },
  {
    labelKey: "nav.transitReconciliation",
    href: "/operations/transit-reconciliation",
    icon: "compare_arrows",
    roles: ["super_admin"],
    section: "common",
    groupId: "aMaterials",
  },
  {
    labelKey: "nav.directivesList",
    href: "/operations/directives",
    icon: "event_note",
    roles: ["super_admin"],
    section: "common",
    groupId: "aDirectives",
  },
  {
    labelKey: "nav.directiveAnalytics",
    href: "/operations/directive-analytics",
    icon: "analytics",
    roles: ["super_admin"],
    section: "common",
    groupId: "aDirectives",
  },
  {
    labelKey: "nav.reconciliation",
    href: "/operations/reconciliation",
    icon: "account_balance_wallet",
    roles: ["super_admin", "b_admin"],
    section: "common",
    groupId: "aInsights",
  },
  {
    labelKey: "nav.exceptions",
    href: "/operations/exceptions",
    icon: "warning",
    roles: ["super_admin"],
    section: "common",
    groupId: "aInsights",
  },
  {
    labelKey: "nav.dashboard",
    href: "/dashboard",
    icon: "dashboard",
    roles: ["super_admin", "b_admin"],
    section: "common",
    groupId: "aInsights",
  },
  {
    labelKey: "nav.bMaterialBundles",
    href: "/operations/bundles",
    icon: "inventory_2",
    roles: ["super_admin", "b_admin"],
    section: "common",
    groupId: "aPartner",
  },

  {
    labelKey: "nav.dailyLog",
    href: "/operations/daily-log",
    icon: "edit_note",
    roles: ["b_staff"],
    section: "role",
    groupId: "bProduction",
  },
  {
    labelKey: "nav.productionCalendar",
    href: "/operations/production-calendar",
    icon: "calendar_month",
    roles: ["super_admin", "b_admin", "b_staff"],
    section: "role",
    groupId: "bProduction",
  },
  {
    labelKey: "nav.dailyLogHistory",
    href: "/operations/daily-log/history",
    icon: "history",
    roles: ["b_admin"],
    section: "role",
    groupId: "bProduction",
  },
  {
    labelKey: "nav.materialRequestsHub",
    href: "/operations/material-requests",
    icon: "add_shopping_cart",
    roles: ["b_admin"],
    section: "role",
    groupId: "bMaterials",
    excludeChildPaths: [
      "/operations/material-requests/production",
      "/operations/material-requests/spot",
    ],
  },
  {
    labelKey: "nav.materialRequestProduction",
    href: "/operations/material-requests/production",
    icon: "precision_manufacturing",
    roles: ["b_admin"],
    section: "role",
    groupId: "bMaterials",
  },
  {
    labelKey: "nav.materialRequestSpot",
    href: "/operations/material-requests/spot",
    icon: "build_circle",
    roles: ["b_admin"],
    section: "role",
    groupId: "bMaterials",
  },
  {
    labelKey: "nav.materialReceipt",
    href: "/operations/material-receipt",
    icon: "inventory_2",
    roles: ["b_admin"],
    section: "role",
    groupId: "bMaterials",
  },
  {
    labelKey: "nav.bFinishedShipments",
    href: "/operations/shipments",
    icon: "local_shipping",
    roles: ["b_admin"],
    section: "role",
    groupId: "bMaterials",
  },

  {
    labelKey: "nav.productionOrders",
    href: "/operations/orders",
    icon: "assignment",
    roles: ["super_admin"],
    section: "role",
    groupId: "erp",
  },
  {
    labelKey: "nav.workOrders",
    href: "/erp/work-orders",
    icon: "precision_manufacturing",
    roles: ["super_admin"],
    section: "role",
    groupId: "erp",
  },
  {
    labelKey: "nav.purchaseOrders",
    href: "/erp/purchase-orders",
    icon: "shopping_cart",
    roles: ["super_admin"],
    section: "role",
    groupId: "erp",
  },
  {
    labelKey: "nav.bom",
    href: "/erp/bom",
    icon: "account_tree",
    roles: ["super_admin"],
    section: "role",
    groupId: "erp",
  },
  {
    labelKey: "nav.inventory",
    href: "/erp/inventory",
    icon: "inventory_2",
    roles: ["super_admin"],
    section: "role",
    groupId: "erp",
  },
  {
    labelKey: "nav.assemblyBuilds",
    href: "/erp/assembly-builds",
    icon: "build",
    roles: ["super_admin"],
    section: "role",
    groupId: "erp",
  },

  {
    labelKey: "nav.users",
    href: "/admin/users",
    icon: "group",
    roles: ["super_admin"],
    section: "admin",
    groupId: "admin",
  },
  {
    labelKey: "nav.companies",
    href: "/admin/companies",
    icon: "business",
    roles: ["super_admin"],
    section: "admin",
    groupId: "admin",
  },
  {
    labelKey: "nav.settings",
    href: "/admin/settings",
    icon: "settings",
    roles: ["super_admin"],
    section: "admin",
    groupId: "admin",
  },
  {
    labelKey: "nav.audit",
    href: "/admin/audit",
    icon: "history",
    roles: ["super_admin"],
    section: "admin",
    groupId: "admin",
  },
];

export type GroupedNav = Record<NavSectionId, NavItem[]>;

export type NavTreeGroup = {
  def: NavGroupDef;
  items: NavItem[];
};

export type NavTreeSection = {
  standalone: NavItem[];
  groups: NavTreeGroup[];
};

export type NavTree = Record<NavSectionId, NavTreeSection>;

export function isNavItemActive(
  pathname: string,
  item: NavItem,
): boolean {
  if (pathname === item.href) return true;
  if (!pathname.startsWith(`${item.href}/`)) return false;
  if (
    item.excludeChildPaths?.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )
  ) {
    return false;
  }
  return true;
}

function visibleItems(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function getGroupedNav(role: UserRole): GroupedNav {
  const visible = visibleItems(role);
  return {
    common: visible.filter((item) => item.section === "common"),
    role: visible.filter((item) => item.section === "role"),
    admin: visible.filter((item) => item.section === "admin"),
  };
}

export function getNavTree(role: UserRole): NavTree {
  const visible = visibleItems(role);
  const sections: NavSectionId[] = ["common", "role", "admin"];
  const tree = {} as NavTree;

  for (const sectionId of sections) {
    const sectionItems = visible.filter((i) => i.section === sectionId);
    const standalone = sectionItems.filter((i) => !i.groupId);
    const groups: NavTreeGroup[] = [];

    for (const def of NAV_GROUPS.filter((g) => g.section === sectionId).sort(
      (a, b) => a.order - b.order,
    )) {
      const items = sectionItems.filter((i) => i.groupId === def.id);
      if (items.length > 0) groups.push({ def, items });
    }

    tree[sectionId] = { standalone, groups };
  }

  return tree;
}

export function flattenNavTree(section: NavTreeSection): NavItem[] {
  return [
    ...section.standalone,
    ...section.groups.flatMap((g) => g.items),
  ];
}

export const MOBILE_NAV = [
  { labelKey: "nav.mobileList", href: "/m" },
  { labelKey: "nav.mobileScan", href: "/m/receiving/scan" },
];

/** @deprecated use getGroupedNav */
export function filterFlatNav(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
