import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense, cache } from "react";
import { createClient } from "@/utils/supabase/server";

const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"));
const ContinueWatchingList = dynamic(
  () => import("@/components/sections/ContinueWatching/List")
);

export const metadata: Metadata = {
  title: `Continue Watching | ${siteConfig.name}`,
};

const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});

const ContinueWatchingPage: NextPage = async () => {
  const { user, error } = await getUser();

  return (
    <Suspense>
      {error || !user ? (
        <UnauthorizedNotice
          title="Sign in to continue watching"
          description="Create a free account to resume your videos from where you left off!"
        />
      ) : (
        <ContinueWatchingList />
      )}
    </Suspense>
  );
};

export default ContinueWatchingPage;
