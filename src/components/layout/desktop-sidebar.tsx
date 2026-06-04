"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { RoleMenu, getRoleLevelKey } from "@/components/layout/role-menu";
import { useSidebarLayout } from "@/components/layout/sidebar-layout-context";
import { HubBrandIcon } from "@/components/ui/hub-brand-icon";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useLocale } from "@/components/providers/locale-provider";
import { useRole } from "@/components/providers/role-provider";
import {
  NAV_SECTIONS,
  flattenNavTree,
  getNavTree,
  isNavItemActive,
  type NavItem,
  type NavSectionId,
  type NavTreeGroup,
  type NavTreeSection,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

const SPRING = "cubic-bezier(0.25, 1.1, 0.4, 1)";
const NAV_GROUP_STORAGE_KEY = "nav-groups-open-v1";

function readOpenGroups(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NAV_GROUP_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function resolveSection(
  pathname: string,
  tree: ReturnType<typeof getNavTree>,
): NavSectionId {
  for (const section of NAV_SECTIONS) {
    const flat = flattenNavTree(tree[section.id]);
    if (flat.some((item) => isNavItemActive(pathname, item))) {
      return section.id;
    }
  }
  if (tree.common.standalone.length + tree.common.groups.length > 0) {
    return "common";
  }
  if (tree.role.standalone.length + tree.role.groups.length > 0) {
    return "role";
  }
  return "admin";
}

const NavLink = memo(function NavLink({
  item,
  active,
  label,
  collapsed,
  dark,
  nested,
}: {
  item: NavItem;
  active: boolean;
  label: string;
  collapsed: boolean;
  dark: boolean;
  nested?: boolean;
}) {
  return (
    <Link
      href={item.href}
      prefetch
      title={collapsed ? label : undefined}
      className={cn(
        "my-0.5 flex cursor-pointer items-center rounded-lg transition-colors duration-300",
        collapsed
          ? "mx-auto h-10 w-10 justify-center"
          : cn("h-9 w-full", nested ? "pl-9 pr-3" : "h-10 px-3"),
        active
          ? dark
            ? "bg-nav-dark-active font-semibold text-nav-dark-text"
            : "bg-scm-surface-container font-semibold text-scm-secondary"
          : dark
            ? "text-nav-dark-muted hover:bg-nav-dark-hover hover:text-nav-dark-icon"
            : "text-scm-on-surface-variant hover:bg-scm-surface-container hover:text-scm-on-surface",
      )}
      style={{ transitionTimingFunction: SPRING }}
    >
      <MaterialIcon
        name={item.icon}
        className={cn("shrink-0", nested ? "text-[18px]" : "text-[20px]")}
      />
      {!collapsed ? (
        <span className={cn("ml-3 truncate", nested ? "text-[13px]" : "text-sm")}>
          {label}
        </span>
      ) : null}
    </Link>
  );
});

function NavGroupBlock({
  group,
  pathname,
  labels,
  collapsed,
  dark,
  open,
  onToggle,
}: {
  group: NavTreeGroup;
  pathname: string;
  labels: Record<string, string>;
  collapsed: boolean;
  dark: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const groupActive = group.items.some((item) =>
    isNavItemActive(pathname, item),
  );

  if (collapsed) {
    const first = group.items[0];
    if (!first) return null;
    return (
      <NavLink
        item={first}
        active={groupActive}
        label={labels[group.def.labelKey]}
        collapsed
        dark={dark}
      />
    );
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center rounded-lg px-2 transition-colors duration-300",
          groupActive
            ? dark
              ? "text-nav-dark-text"
              : "text-scm-primary"
            : dark
              ? "text-nav-dark-muted hover:bg-nav-dark-hover hover:text-nav-dark-icon"
              : "text-scm-on-surface-variant hover:bg-scm-surface-container hover:text-scm-on-surface",
        )}
        style={{ transitionTimingFunction: SPRING }}
      >
        <MaterialIcon name={group.def.icon} className="shrink-0 text-[18px]" />
        <span className="ml-2 min-w-0 flex-1 truncate text-left text-xs font-semibold">
          {labels[group.def.labelKey]}
        </span>
        <MaterialIcon
          name="expand_more"
          className={cn(
            "shrink-0 text-[18px] transition-transform duration-300",
            open && "rotate-180",
          )}
          style={{ transitionTimingFunction: SPRING }}
        />
      </button>
      {open ? (
        <div className="mt-0.5 border-l border-scm-outline-variant/60 pl-1 ml-3">
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isNavItemActive(pathname, item)}
              label={labels[item.labelKey]}
              collapsed={false}
              dark={dark}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavTreePanel({
  section,
  pathname,
  labels,
  collapsed,
  dark,
  openGroups,
  onToggleGroup,
}: {
  section: NavTreeSection;
  pathname: string;
  labels: Record<string, string>;
  collapsed: boolean;
  dark: boolean;
  openGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
}) {
  return (
    <>
      {section.standalone.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isNavItemActive(pathname, item)}
          label={labels[item.labelKey]}
          collapsed={collapsed}
          dark={dark}
        />
      ))}
      {section.groups.map((group) => (
        <NavGroupBlock
          key={group.def.id}
          group={group}
          pathname={pathname}
          labels={labels}
          collapsed={collapsed}
          dark={dark}
          open={openGroups[group.def.id] ?? group.def.defaultOpen ?? false}
          onToggle={() => onToggleGroup(group.def.id)}
        />
      ))}
    </>
  );
}

function IconRailButton({
  active,
  icon,
  label,
  onClick,
  dark,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
  dark: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors duration-300",
        active
          ? dark
            ? "bg-nav-dark-active text-nav-dark-text"
            : "bg-scm-surface-container text-scm-secondary"
          : dark
            ? "text-nav-dark-muted hover:bg-nav-dark-hover hover:text-nav-dark-icon"
            : "text-scm-on-surface-variant hover:bg-scm-surface-container hover:text-scm-on-surface",
      )}
      style={{ transitionTimingFunction: SPRING }}
    >
      <MaterialIcon name={icon} className="text-[20px]" />
    </button>
  );
}

function DetailPanel({
  section,
  title,
  pathname,
  labels,
  collapsed,
  onToggleCollapse,
  roleLevelLabel,
  dark,
  openGroups,
  onToggleGroup,
}: {
  section: NavTreeSection;
  title: string;
  pathname: string;
  labels: Record<string, string>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  roleLevelLabel: string;
  dark: boolean;
  openGroups: Record<string, boolean>;
  onToggleGroup: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 flex-col transition-[width,padding,background-color] duration-500",
        dark ? "bg-nav-dark-bg" : "bg-scm-surface-lowest",
        collapsed ? "w-16 px-0" : "w-64 px-3",
      )}
      style={{ transitionTimingFunction: SPRING }}
    >
      <div
        className={cn(
          "flex shrink-0 items-center py-4",
          collapsed ? "justify-center" : "justify-between pl-1 pr-0",
        )}
      >
        {!collapsed ? (
          <h2
            className={cn(
              "truncate text-lg font-semibold",
              dark ? "text-nav-dark-text" : "text-scm-primary",
            )}
          >
            {title}
          </h2>
        ) : null}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors",
            dark
              ? "text-nav-dark-muted hover:bg-nav-dark-hover hover:text-nav-dark-icon"
              : "text-scm-on-surface-variant hover:bg-scm-surface-container hover:text-scm-on-surface",
          )}
        >
          <MaterialIcon
            name="chevron_left"
            className={cn(
              "text-[20px] transition-transform duration-500",
              collapsed && "rotate-180",
            )}
            style={{ transitionTimingFunction: SPRING }}
          />
        </button>
      </div>

      {!collapsed ? (
        <p
          className={cn(
            "mb-3 px-1 text-[10px] font-semibold uppercase tracking-wider",
            dark ? "text-nav-dark-muted" : "text-scm-on-surface-variant",
          )}
        >
          Supply Chain Hub
        </p>
      ) : null}

      <nav
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2",
          collapsed && "flex flex-col items-center",
        )}
      >
        <NavTreePanel
          section={section}
          pathname={pathname}
          labels={labels}
          collapsed={collapsed}
          dark={dark}
          openGroups={openGroups}
          onToggleGroup={onToggleGroup}
        />
      </nav>

      <div
        className={cn(
          "shrink-0 border-t py-3",
          dark ? "border-nav-dark-border" : "border-scm-outline-variant",
          collapsed ? "flex justify-center" : "px-1",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "flex-col gap-2",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
              dark
                ? "border-nav-dark-border bg-nav-dark-hover text-nav-dark-icon"
                : "border-scm-outline-variant bg-scm-surface-container",
            )}
          >
            <MaterialIcon name="person" className="text-base" />
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <RoleMenu variant="sidebar" dark={dark} />
              <p
                className={cn(
                  "mt-1 text-[10px] uppercase tracking-wider",
                  dark ? "text-nav-dark-muted" : "text-scm-on-surface-variant",
                )}
              >
                {roleLevelLabel}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const DesktopSidebar = memo(function DesktopSidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const { t } = useLocale();
  const { detailCollapsed, toggleDetailCollapsed, navDark, toggleNavDark } =
    useSidebarLayout();
  const tree = useMemo(() => getNavTree(role), [role]);

  const visibleSections = useMemo(
    () =>
      NAV_SECTIONS.filter((s) => {
        const sec = tree[s.id];
        return sec.standalone.length > 0 || sec.groups.length > 0;
      }),
    [tree],
  );

  const [activeSection, setActiveSection] = useState<NavSectionId>(() =>
    resolveSection(pathname, tree),
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveSection(resolveSection(pathname, tree));
  }, [pathname, tree]);

  useEffect(() => {
    const stored = readOpenGroups();
    const merged: Record<string, boolean> = { ...stored };
    for (const section of Object.values(tree)) {
      for (const g of section.groups) {
        if (merged[g.def.id] === undefined) {
          merged[g.def.id] = g.def.defaultOpen ?? false;
        }
        if (g.items.some((item) => isNavItemActive(pathname, item))) {
          merged[g.def.id] = true;
        }
      }
    }
    setOpenGroups(merged);
  }, [pathname, tree]);

  const toggleGroup = useCallback((id: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(NAV_GROUP_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const labels = useMemo(() => {
    const keys = new Set<string>();
    NAV_SECTIONS.forEach((s) => keys.add(s.titleKey));
    Object.values(tree).forEach((sec) => {
      sec.standalone.forEach((item) => keys.add(item.labelKey));
      sec.groups.forEach((g) => {
        keys.add(g.def.labelKey);
        g.items.forEach((item) => keys.add(item.labelKey));
      });
    });
    keys.add(getRoleLevelKey(role));
    const map: Record<string, string> = {};
    keys.forEach((key) => {
      map[key] = t(key);
    });
    return map;
  }, [tree, role, t]);

  const activeConfig =
    visibleSections.find((s) => s.id === activeSection) ?? visibleSections[0];
  const activeSectionTree = activeConfig ? tree[activeConfig.id] : null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 flex h-full border-r transition-colors duration-300",
        navDark
          ? "border-nav-dark-border bg-nav-dark-bg"
          : "border-scm-outline-variant bg-scm-surface-lowest",
      )}
    >
      <div
        className={cn(
          "flex w-16 shrink-0 flex-col items-center border-r py-4",
          navDark ? "border-nav-dark-border" : "border-scm-outline-variant",
        )}
      >
        <button
          type="button"
          onClick={toggleNavDark}
          aria-label={t("nav.themeToggle")}
          title={t("nav.themeToggle")}
          className={cn(
            "mb-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg px-1 transition-colors",
            navDark
              ? "hover:bg-nav-dark-hover"
              : "hover:bg-scm-surface-container",
          )}
        >
          <HubBrandIcon
            className={cn(
              "h-[18px] w-[27px] transition-colors duration-300",
              navDark ? "text-nav-dark-text" : "text-scm-primary",
            )}
          />
        </button>

        <div
          className={cn(
            "mb-2 h-px w-8",
            navDark ? "bg-nav-dark-border" : "bg-scm-outline-variant",
          )}
        />

        <div className="flex w-full flex-col items-center gap-1">
          {visibleSections
            .filter((s) => !s.pinned)
            .map((section) => (
              <IconRailButton
                key={section.id}
                active={activeSection === section.id}
                icon={section.icon}
                label={labels[section.titleKey]}
                onClick={() => setActiveSection(section.id)}
                dark={navDark}
              />
            ))}
        </div>

        <div className="flex-1" />

        {visibleSections
          .filter((s) => s.pinned)
          .map((section) => (
            <IconRailButton
              key={section.id}
              active={activeSection === section.id}
              icon={section.icon}
              label={labels[section.titleKey]}
              onClick={() => setActiveSection(section.id)}
              dark={navDark}
            />
          ))}
      </div>

      {activeConfig && activeSectionTree ? (
        <DetailPanel
          section={activeSectionTree}
          title={labels[activeConfig.titleKey]}
          pathname={pathname}
          labels={labels}
          collapsed={detailCollapsed}
          onToggleCollapse={toggleDetailCollapsed}
          roleLevelLabel={labels[getRoleLevelKey(role)]}
          dark={navDark}
          openGroups={openGroups}
          onToggleGroup={toggleGroup}
        />
      ) : null}
    </aside>
  );
});
