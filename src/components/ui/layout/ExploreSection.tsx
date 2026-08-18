"use client";

import { Icon } from "@iconify/react";
import { SidebarSection } from "./SidebarSection";
import { SidebarLink } from "./SidebarLink";
import { useSidebar } from "./SidebarContext";

export const ExploreSection: React.FC = () => {
  const { collapsed } = useSidebar();
  return (
    <SidebarSection title="Explore" hideTitle={collapsed}>
      <SidebarLink
        href="/discover?type=todayTrending"
        icon={<Icon icon="mdi:fire" width={22} height={22} />}
        label="Today's Trending"
      />
      <SidebarLink
        href="/discover?type=thisWeekTrending"
        icon={<Icon icon="mdi:chart-line" width={22} height={22} />}
        label="This Week's Trending"
      />
      <SidebarLink
        href="/discover?type=topRated"
        icon={<Icon icon="mdi:trophy" width={22} height={22} />}
        label="Top Rated"
      />
      <SidebarLink
        href="/discover?type=popular"
        icon={<Icon icon="mdi:star" width={22} height={22} />}
        label="Most Popular"
      />
      <SidebarLink
        href="/discover?content=tv&type=asianDramas"
        icon={<Icon icon="mdi:earth" width={22} height={22} />}
        label="Asian Dramas"
      />
      <SidebarLink
        href="/discover?content=tv&type=onTheAir"
        icon={<Icon icon="mdi:broadcast" width={22} height={22} />}
        label="On The Air"
      />
      <SidebarLink
        href="/discover?type=upcoming"
        icon={<Icon icon="mdi:movie-open" width={22} height={22} />}
        label="Upcoming"
      />
    </SidebarSection>
  );
};
