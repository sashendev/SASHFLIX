"use client";

import { useState } from "react";
import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/utils/helpers";
import { Icon } from "@iconify/react";
import { useSidebar } from "./SidebarContext";

interface SidebarExpandableProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /**
   * The route the parent button links to.
   * - In collapsed mode, the parent button always navigates here.
   * - In expanded mode, the chevron still toggles the submenu; clicking the
   *   icon-or-label area also navigates.
   */
  routeHref?: string;
}

export const SidebarExpandable: React.FC<SidebarExpandableProps> = ({
  icon,
  label,
  children,
  defaultOpen = true,
  routeHref,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);
  const { collapsed } = useSidebar();

  // In collapsed mode, only show children on hover (YouTube-like flyout).
  const showChildren = collapsed ? isHovered : isOpen;

  return (
    <div
      className="relative flex flex-col gap-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        title={collapsed ? label : undefined}
        aria-label={label}
        className={cn(
          "group flex items-center gap-1 rounded-lg text-sm transition-colors",
          collapsed ? "justify-center px-2 py-2" : "px-2 py-2",
          "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        {routeHref ? (
          <Link
            href={routeHref}
            className={cn("flex flex-1 items-center gap-3", collapsed && "justify-center")}
            aria-label={label}
          >
            {icon && (
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-lg">
                {icon}
              </span>
            )}
            {!collapsed && <span className="flex-1 text-start">{label}</span>}
          </Link>
        ) : (
          <div className={cn("flex flex-1 items-center gap-3", collapsed && "justify-center")}>
            {icon && (
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-lg">
                {icon}
              </span>
            )}
            {!collapsed && <span className="flex-1 text-start">{label}</span>}
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Collapse" : "Expand"}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/60 hover:bg-foreground/10 hover:text-foreground"
          >
            <Icon
              icon="mdi:chevron-right"
              className={cn(
                "flex-shrink-0 transition-transform",
                isOpen ? "rotate-90" : "",
              )}
              width={18}
              height={18}
            />
          </button>
        )}
        {collapsed && (
          <span
            className={cn(
              "pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-foreground/10 bg-background px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100",
            )}
          >
            {label}
          </span>
        )}
      </div>

      {showChildren && (
        <div
          className={cn(
            "flex flex-col gap-1",
            collapsed
              ? "absolute left-full top-0 z-50 ml-2 min-w-[200px] rounded-lg border border-foreground/10 bg-background p-2 shadow-xl"
              : "ml-2 border-l border-foreground/10 pl-2",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
