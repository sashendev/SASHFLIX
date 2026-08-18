"use client";

import { getUserHistories } from "@/actions/histories";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { isEmpty } from "@/utils/helpers";
import { getLoadingLabel } from "@/utils/movies";
import { Spinner, Button } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import MoviePosterCard from "../Movie/Cards/Poster";
import TvShowPosterCard from "../TV/Cards/Poster";
import { ITEMS_PER_PAGE } from "@/utils/constants";

const HistoryList = () => {
  const { ref, inViewport } = useInViewport();
  const { content } = useDiscoverFilters();
  const { data: user, isLoading: isUserLoading } = useSupabaseUser();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } =
    useInfiniteQuery({
      queryKey: ["history", content, user?.id],
      queryFn: async ({ pageParam = 1 }) => {
        if (!user) return { success: true, data: [] };
        const result = await getUserHistories(ITEMS_PER_PAGE, pageParam);
        if (!result.success) return { success: false, data: [] };

        // Filter by selected content type (movie or tv)
        const filtered = result.data?.filter((item) => item.type === content) || [];

        return { success: true, data: filtered };
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage.success || isEmpty(lastPage.data)) {
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
        <p className="text-danger">Failed to load history</p>
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
              {allItems.map((item) => {
                const progress =
                  item.duration && item.last_position
                    ? Math.min((item.last_position / item.duration) * 100, 99)
                    : 0;

                if (item.type === "tv") {
                  return (
                    <Suspense key={`tv-${item.media_id}`}>
                      <TvShowPosterCard
                        variant="bordered"
                        tv={{
                          adult: item.adult,
                          backdrop_path: item.backdrop_path,
                          first_air_date: item.release_date,
                          id: item.media_id,
                          name: item.title,
                          poster_path: item.poster_path || "",
                          vote_average: item.vote_average,
                        } as any}
                        playbackProgress={progress}
                        historyId={item.id}
                      />
                    </Suspense>
                  );
                }
                return (
                  <Suspense key={`movie-${item.media_id}`}>
                    <MoviePosterCard
                      variant="bordered"
                      movie={{
                        adult: item.adult,
                        backdrop_path: item.backdrop_path,
                        id: item.media_id,
                        poster_path: item.poster_path || "",
                        release_date: item.release_date,
                        title: item.title,
                        vote_average: item.vote_average,
                      } as any}
                      playbackProgress={progress}
                      historyId={item.id}
                    />
                  </Suspense>
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
                  You have reached the end of your history.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-[30vh] items-center justify-center">
            <p className="text-default-500">
              No {content === "movie" ? "movies" : "TV shows"} in your history yet.
            </p>
          </div>
        )}
      </div>

      <BackToTopButton />
    </>
  );
};

export default HistoryList;
