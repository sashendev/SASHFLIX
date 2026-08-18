"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@heroui/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Chip } from "@heroui/chip";

const BottomNavbar = () => {
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const show = ["/", "/discover", "/you", "/about"].includes(pathName);

  return (
    show && (
      <>
        <div className="pt-20 md:hidden" />
        <div className="fixed bottom-0 left-0 z-50 block h-fit w-full translate-y-px border-t border-secondary-background bg-background py-2 md:hidden">
          <div className="mx-auto grid h-full max-w-lg grid-cols-5">
            {siteConfig.mobileNavItems.map((item: any) => {
              const isTrending =
                pathName === "/discover" &&
                searchParams.get("type") === "todayTrending";

              const isActive =
                item.href === "/discover?type=todayTrending"
                  ? isTrending
                  : pathName === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="flex items-center justify-center text-foreground"
                >
                  <div className="flex max-h-[50px] flex-col items-center justify-center">
                    <Chip
                      size="lg"
                      variant={isActive ? "solid" : "light"}
                      classNames={{
                        base: "py-[2px] transition-all",
                        content: "size-full",
                      }}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </Chip>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </>
    )
  );
};

export default BottomNavbar;
