"use client";

import { Icon } from "@iconify/react";
import { SidebarExpandable } from "./SidebarExpandable";
import { SidebarLink } from "./SidebarLink";

export const YouSection: React.FC = () => {
  return (
    <SidebarExpandable
      icon={<Icon icon="mdi:account-circle" width={22} height={22} />}
      label="You"
      routeHref="/you"
      defaultOpen={true}
    >
      <SidebarLink
        href="/history"
        icon={<Icon icon="mdi:history" width={20} height={20} />}
        label="History"
      />
      <SidebarLink
        href="/continue-watching"
        icon={<Icon icon="mdi:play-circle" width={20} height={20} />}
        label="Continue Watching"
      />
      <SidebarLink
        href="/watch-later"
        icon={<Icon icon="mdi:clock" width={20} height={20} />}
        label="Watch Later"
      />
    </SidebarExpandable>
  );
};
