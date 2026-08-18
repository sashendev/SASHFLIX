"use client";

import { getContinueWatching } from "@/actions/library";
import { queryClient } from "@/app/providers";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { isEmpty } from "@/utils/helpers";
import { getLoadingLabel } from "@/utils/movies";
import { Spinner, Button, Progress } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import MoviePosterCard from "../Movie/Cards/Poster";
import TvShowPosterCard from "../TV/Cards/Poster";
import { ITEMS_PER_PAGE } from "@/utils/constants";

const ContinueWatchingList = () => {
  const { ref, inViewport } = useInViewport();
  const { content } = useDiscoverFilters();
  const { data: user, isLoading: isUserLoading } = useSupabaseUser();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } =
    useInfiniteQuery({
      queryKey: ["continue-watching", content, user?.id],
      queryFn: async ({ pageParam = 1 }) => {
        if (!user) return { success: true, data: [] };
        return await getContinueWatching(content as "movie" | "tv" | "all", pageParam, ITEMS_PER_PAGE);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage.success || !lastPage.hasNextPage) {
          return undefined;
        }
        return pages.length + 1;
      },
      enabled: !isUserLoading,
      staleTime: 1000 * 60 * 5,
    });

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport]);

  if (status === "error") {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-danger">Failed to load continue watching</p>
        <Button color="primary" onPress={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const allItems = data?.pages.flatMap((page) => page.data || []) || [];
  const hasItems = !isEmpty(allItems);

  return (
    <>
      <div className="relative flex flex-col items-center justify-center gap-10">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <ContentTypeSelection className="justify-center" />
        </div>
        {status === "pending" ? (
          <Spinner
            size="lg"
            variant="simple"
            className="absolute-center mt-[30vh]"
            color={content === "movie" ? "primary" : "warning"}
          />
        ) : hasItems ? (
          <>
            <div className="movie-grid">
              {allItems.map((item: any) => {
                const progress =
                  item.duration && item.last_position
                    ? Math.min((item.last_position / item.duration) * 100, 99)
                    : 0;

                return (
                  <div key={`${item.type}-${item.id}`} className="group relative">
                    {/* Render appropriate card based on content type */}
                    {item.type === "tv" ? (
                      // @ts-ignore: passing minimal TV props
                      <TvShowPosterCard
                        variant="bordered"
                        tv={{
                          adult: item.adult,
                          backdrop_path: item.backdrop_path,
                          first_air_date: item.release_date,
                          id: item.id,
                          name: item.title,
                          poster_path: item.poster_path || "",
                          vote_average: item.vote_average,
                        } as any}
                        playbackProgress={progress}
                        historyId={item.id}
                      />
                    ) : (
                      <MoviePosterCard
                        variant="bordered"
                        movie={{
                          adult: item.adult,
                          backdrop_path: item.backdrop_path,
                          id: item.id,
                          poster_path: item.poster_path || "",
                          release_date: item.release_date,
                          title: item.title,
                          vote_average: item.vote_average,
                        } as any}
                        playbackProgress={progress}
                        historyId={item.id}
                      />
                    )}
                    {/* Progress bar overlay */}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 z-10">
                        <Progress
                          value={progress}
                          className="h-1 rounded-none"
                          color={progress > 90 ? "success" : progress > 50 ? "warning" : "primary"}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div ref={ref} className="flex h-24 items-center justify-center">
              {isFetchingNextPage && (
                <Spinner
                  size="lg"
                  variant="wave"
                  label={getLoadingLabel()}
                  color={content === "movie" ? "primary" : "warning"}
                />
              )}
              {!hasNextPage && !isFetchingNextPage && allItems.length > 0 && (
                <p className="text-muted-foreground text-center text-base">
                  No more items to continue watching.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-[30vh] items-center justify-center">
            <p className="text-default-500">
              No {content === "movie" ? "movies" : "TV shows"} to continue watching yet.
            </p>
          </div>
        )}
      </div>

      <BackToTopButton />
    </>
  );
};

export default ContinueWatchingList;
