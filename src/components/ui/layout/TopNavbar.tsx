"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserProfileButton from "../button/UserProfileButton";
import SearchInput from "../input/SearchInput";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";
import BrandLogo from "../other/BrandLogo";
import { useSidebar } from "./SidebarContext";

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const opacity = Math.min((y / 1000) * 5, 1);
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const player = pathName.includes("/player");
  const auth = pathName.includes("/auth");
  const { collapsed, toggle } = useSidebar();

  if (auth || player) return null;

  return (
    <Navbar
      disableScrollHandler
      isBlurred={false}
      position="sticky"
      maxWidth="full"
      classNames={{ wrapper: "px-2 md:px-4" }}
      className={cn("inset-0 h-min bg-transparent", {
        "bg-background": show,
      })}
    >
      {!show && (
        <div
          className="border-background bg-background absolute inset-0 h-full w-full border-b"
          style={{ opacity: opacity }}
        />
      )}
      <NavbarBrand className="gap-2">
        {show ? (
          <>
            <Button
              isIconOnly
              variant="light"
              radius="full"
              size="sm"
              aria-label="Toggle sidebar"
              onPress={toggle}
              className="hidden md:flex"
            >
              <Icon
                icon={collapsed ? "mdi:menu" : "mdi:menu-open"}
                width={22}
                height={22}
              />
            </Button>
            <BrandLogo />
          </>
        ) : (
          <BackButton href={tv ? "/?content=tv" : "/"} />
        )}
      </NavbarBrand>
      {show && !pathName.startsWith("/search") && (
        <NavbarContent className="hidden w-full max-w-lg gap-2 md:flex" justify="center">
          <NavbarItem className="w-full">
            <Link href="/search" className="w-full">
              <SearchInput
                className="pointer-events-none"
                placeholder="Search your favorite movies..."
              />
            </Link>
          </NavbarItem>
        </NavbarContent>
      )}
      <NavbarContent justify="end">
        <NavbarItem className="flex gap-1">
          <ThemeSwitchDropdown />
          <UserProfileButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default TopNavbar;
