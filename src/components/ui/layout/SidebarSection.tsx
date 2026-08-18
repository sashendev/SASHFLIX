"use client";

import { Divider } from "@heroui/react";
import { ReactNode } from "react";

interface SidebarSectionProps {
  children: ReactNode;
  title?: string;
  showDivider?: boolean;
  hideTitle?: boolean;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  children,
  title,
  showDivider = true,
  hideTitle = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {showDivider && <Divider className="my-1" />}
      {title && !hideTitle && (
        <p className="px-2 text-xs font-semibold uppercase text-foreground/50">{title}</p>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
};
