import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense, cache } from "react";
import { createClient } from "@/utils/supabase/server";

const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"));
const WatchLaterList = dynamic(() => import("@/components/sections/Library/List"));

export const metadata: Metadata = {
  title: `Watch Later | ${siteConfig.name}`,
};

const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});

const WatchLaterPage: NextPage = async () => {
  const { user, error } = await getUser();

  return (
    <Suspense>
      {error || !user ? (
        <UnauthorizedNotice
          title="Sign in to view your watch later list"
          description="Create a free account to save movies and TV shows for later!"
        />
      ) : (
        <WatchLaterList />
      )}
    </Suspense>
  );
};

export default WatchLaterPage;
