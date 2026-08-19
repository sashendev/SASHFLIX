"use client";

import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@/utils/helpers";
import { SidebarLink } from "./SidebarLink";
import { SidebarSection } from "./SidebarSection";
import { YouSection } from "./YouSection";
import { ExploreSection } from "./ExploreSection";
import { CategoryList } from "./CategoryList";
import { useSidebar } from "./SidebarContext";

const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathName = usePathname();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const shouldShowSidebar = hrefs.includes(pathName);
  const { collapsed } = useSidebar();

  const railWidth = collapsed ? "w-16" : "w-60";
  const navPadding = collapsed ? "px-2" : "px-3";

  return (
    <div className="flex h-full">
      {shouldShowSidebar && (
        <div className="hidden md:block">
          <div className={cn("left-0 top-0 transition-[width] duration-200", railWidth)} />
          <aside
            className={cn(
              "fixed left-0 top-16 z-30 h-[calc(100vh-64px)] border-r border-foreground/10 overflow-y-auto overflow-x-hidden transition-[width] duration-200",
              railWidth,
            )}
          >
            <nav className={cn("flex flex-col gap-4 py-4", navPadding)}>
              {/* Main Navigation */}
              <SidebarSection showDivider={false} hideTitle={collapsed}>
                <SidebarLink
                  href="/"
                  icon={<Icon icon="mdi:home-variant" width={22} height={22} />}
                  label="Home"
                />
              </SidebarSection>

              {/* Discover Section */}
              <CategoryList />

              {/* You Section */}
              <YouSection />

              {/* Explore Section */}
              <ExploreSection />

              {/* Footer Links */}
              <SidebarSection title={collapsed ? undefined : "More"}>
                <SidebarLink
                  href="/about"
                  icon={<Icon icon="mdi:information-variant-circle" width={22} height={22} />}
                  label="About"
                />
              </SidebarSection>
            </nav>
          </aside>
        </div>
      )}
      {children}
    </div>
  );
};

export default Sidebar;
