import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense, cache } from "react";
import { createClient } from "@/utils/supabase/server";

const UnauthorizedNotice = dynamic(() => import("@/components/ui/notice/Unauthorized"));
const HistoryList = dynamic(() => import("@/components/sections/History/List"));

export const metadata: Metadata = {
  title: `History | ${siteConfig.name}`,
};

const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});

const HistoryPage: NextPage = async () => {
  const { user, error } = await getUser();

  return (
    <Suspense>
      {error || !user ? (
        <UnauthorizedNotice
          title="Sign in to view your history"
          description="Create a free account to track your watched movies and TV shows!"
        />
      ) : (
        <HistoryList />
      )}
    </Suspense>
  );
};

export default HistoryPage;
