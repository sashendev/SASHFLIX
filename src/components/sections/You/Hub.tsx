"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton, Link as HeroLink } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useInViewport } from "@mantine/hooks";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import { getUserHistories } from "@/actions/histories";
import { getContinueWatching, getWatchlist } from "@/actions/library";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { isEmpty } from "@/utils/helpers";
import type { Movie, TV } from "tmdb-ts/dist/types";

type FilterType = "movie" | "tv" | "all";

type HubItem = {
  id: number;
  media_id?: number;
  type: string;
  adult: boolean;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date: string;
  title: string;
  vote_average: number;
  duration?: number;
  last_position?: number;
};

const CarouselRow: React.FC<{
  id: string;
  title: string;
  icon: string;
  linkText?: string;
  linkHref?: string;
  loading?: boolean;
  children?: React.ReactNode;
}> = ({
  id,
  title,
  icon,
  linkText = "See All >",
  linkHref,
  loading,
  children,
}) => {
  return (
    <section id={id} className="min-h-[250px] md:min-h-[300px]">
      <div className="z-3 flex flex-col gap-2">
        <div className="flex grow items-center justify-between">
          <SectionTitle color="primary">
            <span className="inline-flex items-center gap-2">
              <Icon icon={icon} width={22} height={22} />
              {title}
            </span>
          </SectionTitle>
          {linkHref && (
            <HeroLink
              as={Link}
              size="sm"
              href={linkHref}
              isBlock
              color="foreground"
              className="rounded-full"
            >
              {linkText}
            </HeroLink>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-48 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};

const Hub = () => {
  const { data: user, isLoading: isUserLoading } = useSupabaseUser();
  const { ref, inViewport } = useInViewport();

  // History (continuous watch record)
  const historyQuery = useQuery({
    queryFn: () => getUserHistories(10),
    queryKey: ["you-history", user?.id],
    enabled: !!user && !isUserLoading && inViewport,
    staleTime: 1000 * 60 * 5,
  });

  // Continue Watching (in progress, not completed)
  const continueWatchingQuery = useQuery({
    queryFn: () => getContinueWatching("all" as FilterType, 1, 10),
    queryKey: ["you-continue-watching", user?.id],
    enabled: !!user && !isUserLoading && inViewport,
    staleTime: 1000 * 60 * 5,
  });

  // Watch Later (bookmarked / saved items)
  const watchLaterQuery = useQuery({
    queryFn: () => getWatchlist("all" as FilterType, 1, 10),
    queryKey: ["you-watch-later", user?.id],
    enabled: !!user && !isUserLoading && inViewport,
    staleTime: 1000 * 60 * 5,
  });

  const historyItems = (historyQuery.data?.data ?? []) as HubItem[];
  const continueItems = (continueWatchingQuery.data?.data ?? []) as HubItem[];
  const watchLaterItems = (watchLaterQuery.data?.data ?? []) as HubItem[];

  const renderCard = (item: HubItem) => {
    const progress =
      item.duration && item.last_position
        ? Math.min((item.last_position / item.duration) * 100, 99)
        : 0;

    if (item.type === "tv") {
      return (
        <TvShowPosterCard
          key={`tv-${item.id ?? item.media_id}`}
          variant="bordered"
          tv={
            {
              adult: item.adult,
              backdrop_path: item.backdrop_path,
              first_air_date: item.release_date,
              id: item.media_id ?? item.id,
              name: item.title,
              poster_path: item.poster_path || "",
              vote_average: item.vote_average,
            } as unknown as TV
          }
          playbackProgress={progress}
            historyId={item.media_id ? item.id : undefined}
        />
      );
    }

    return (
      <MoviePosterCard
        key={`movie-${item.id ?? item.media_id}`}
        variant="bordered"
        movie={
          {
            adult: item.adult,
            backdrop_path: item.backdrop_path,
            id: item.media_id ?? item.id,
            poster_path: item.poster_path || "",
            release_date: item.release_date,
            title: item.title,
            vote_average: item.vote_average,
          } as unknown as Movie
        }
        playbackProgress={progress}
          historyId={item.media_id ? item.id : undefined}
      />
    );
  };

  return (
    <div ref={ref} className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold md:text-3xl">You</h1>
        <p className="text-sm text-foreground/60">
          Your personal viewing activity, all in one place.
        </p>
      </div>

      {/* History Row */}
      <CarouselRow
        id="you-history"
        title="History"
        icon="mdi:history"
        linkHref="/history"
        loading={historyQuery.isPending}
      >
        {!isEmpty(historyItems) ? (
          <Carousel>
            {historyItems.map((item) => (
              <div
                key={`hist-${item.type}-${item.id}`}
                className="embla__slide !flex-[0_0_160px] items-center px-1 py-2 sm:!flex-[0_0_180px] md:!flex-[0_0_200px]"
              >
                {renderCard(item)}
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-default-500">No watch history yet.</p>
          </div>
        )}
      </CarouselRow>

      {/* Continue Watching Row */}
      <CarouselRow
        id="you-continue-watching"
        title="Continue Watching"
        icon="mdi:play-circle"
        linkHref="/continue-watching"
        loading={continueWatchingQuery.isPending}
      >
        {!isEmpty(continueItems) ? (
          <Carousel>
            {continueItems.map((item) => (
              <div
                key={`cw-${item.type}-${item.id}`}
                className="embla__slide !flex-[0_0_160px] items-center px-1 py-2 sm:!flex-[0_0_180px] md:!flex-[0_0_200px]"
              >
                {renderCard(item)}
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-default-500">Nothing to continue right now.</p>
          </div>
        )}
      </CarouselRow>

      {/* Watch Later Row */}
      <CarouselRow
        id="you-watch-later"
        title="Watch Later"
        icon="mdi:clock"
        linkHref="/watch-later"
        loading={watchLaterQuery.isPending}
      >
        {!isEmpty(watchLaterItems) ? (
          <Carousel>
            {watchLaterItems.map((item) => (
              <div
                key={`wl-${item.type}-${item.id ?? item.media_id}`}
                className="embla__slide !flex-[0_0_160px] items-center px-1 py-2 sm:!flex-[0_0_180px] md:!flex-[0_0_200px]"
              >
                {renderCard(item)}
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-default-500">Your watchlist is empty.</p>
          </div>
        )}
      </CarouselRow>

      <BackToTopButton />
    </div>
  );
};

export default Hub;
