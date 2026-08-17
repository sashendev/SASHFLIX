"use client";

import { tmdb } from "@/api/tmdb";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";
import { TvShowDiscoverResult } from "tmdb-ts/dist/types/discover";

interface FetchDiscoverTvShows {
  page?: number;
  type?: DiscoverTvShowsFetchQueryType;
  genres?: string;
}

const fetchDiscoverTvShows = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverTvShows): Promise<TvShowDiscoverResult> => {
  const discover = () => tmdb.discover.tvShow({ page: page, with_genres: genres });
  const todayTrending = () => tmdb.trending.trending("tv", "day", { page: page });
  const thisWeekTrending = () => tmdb.trending.trending("tv", "week", { page: page });
  const popular = () => tmdb.tvShows.popular({ page: page });
  const onTheAir = () => tmdb.tvShows.onTheAir({ page: page });
  const topRated = () => tmdb.tvShows.topRated({ page: page });
  const asianDramas = () =>
    tmdb.discover.tvShow({
      page,
      sort_by: "popularity.desc",
      with_genres: "18",
      with_original_language: "ko|zh|ja",
      // tmdb-ts omits this supported Discover TV parameter from its type definition.
      with_origin_country: "KR|CN|JP",
    } as Parameters<typeof tmdb.discover.tvShow>[0] & { with_origin_country: string });

  const queryData = {
    discover,
    todayTrending,
    thisWeekTrending,
    popular,
    onTheAir,
    topRated,
    asianDramas,
  }[type];

  // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
  return queryData();
};

export default fetchDiscoverTvShows;
