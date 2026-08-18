"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/utils/helpers";
import { useSidebar } from "./SidebarContext";

interface SidebarLinkProps {
  href: string;
  icon?: ReactNode;
  label: string;
  badge?: string;
  onClick?: () => void;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon,
  label,
  badge,
  onClick,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "?");
  const { collapsed } = useSidebar();

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
        collapsed && "justify-center",
        isActive
          ? "bg-primary/20 text-primary font-semibold"
          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      {icon && (
        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-lg">
          {icon}
        </span>
      )}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && (
        <span className="ml-auto rounded bg-primary/30 px-1.5 py-0.5 text-xs">{badge}</span>
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
    </Link>
  );
};
