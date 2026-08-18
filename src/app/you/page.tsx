import { Metadata, NextPage } from "next/types";
import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Suspense, cache } from "react";
import { createClient } from "@/utils/supabase/server";

const UnauthorizedNotice = dynamic(
  () => import("@/components/ui/notice/Unauthorized"),
);
const YouHub = dynamic(() => import("@/components/sections/You/Hub"));

export const metadata: Metadata = {
  title: `You | ${siteConfig.name}`,
};

const getUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
});

const YouPage: NextPage = async () => {
  const { user, error } = await getUser();

  return (
    <Suspense>
      {error || !user ? (
        <UnauthorizedNotice
          title="Sign in to access your personal hub"
          description="Create a free account to track your watched content, resume where you left off, and save movies for later!"
        />
      ) : (
        <YouHub />
      )}
    </Suspense>
  );
};

export default YouPage;
