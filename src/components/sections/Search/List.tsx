"use client";

import { tmdb } from "@/api/tmdb";
import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import { isEmpty } from "@/utils/helpers";
import { getLoadingLabel } from "@/utils/movies";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Movie, Person, Search, TV } from "tmdb-ts/dist/types";
import MoviePosterCard from "../Movie/Cards/Poster";
import SearchFilter from "./Filter";
import PersonCard from "./PersonCard";
import { SearchMode } from "@/actions/search";

type TitleSearchResult =
  | { id: number; type: "movie"; data: Movie }
  | { id: number; type: "tv"; data: TV };

type TitleSearchPage = Search<TitleSearchResult> & { kind: "titles" };
type PeopleSearchPage = Search<Person> & { kind: "people" };
type SearchPage = TitleSearchPage | PeopleSearchPage;

const fetchData = async (page: number, query: string, mode: SearchMode): Promise<SearchPage> => {
  if (mode === "people") {
    return { ...(await tmdb.search.people({ query, page })), kind: "people" };
  }

  const [movies, tvShows] = await Promise.all([
    tmdb.search.movies({ query, page }),
    tmdb.search.tvShows({ query, page }),
  ]);
  const results: TitleSearchResult[] = [
    ...movies.results.map((movie) => ({ id: movie.id, type: "movie" as const, data: movie })),
    ...tvShows.results.map((tv) => ({ id: tv.id, type: "tv" as const, data: tv })),
  ].sort((a, b) => b.data.popularity - a.data.popularity);

  return {
    kind: "titles",
    page,
    results,
    total_pages: Math.max(movies.total_pages, tvShows.total_pages),
    total_results: movies.total_results + tvShows.total_results,
  };
};

const SearchList = () => {
  const { ref, inViewport } = useInViewport();
  const [mode, setMode] = useState<SearchMode>("titles");
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const triggered = !isEmpty(submittedSearchQuery);
  const { data, isFetching, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      enabled: triggered,
      queryKey: ["search-list", mode, submittedSearchQuery],
      queryFn: ({ pageParam: page }) => fetchData(page, submittedSearchQuery, mode),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inViewport, isFetchingNextPage]);

  const renderSearchResults = () => {
    const results = data?.pages[0].results;
    const resultLabel =
      mode === "people" ? "cast members" : "movies and TV shows";

    if (isEmpty(results)) {
      return (
        <h5 className="mt-56 text-center text-xl">
          No {resultLabel} found with query{" "}
          <span className="text-warning font-semibold">&quot;{submittedSearchQuery}&quot;</span>
        </h5>
      );
    }

    return (
      <>
        <h5 className="text-center text-xl">
          <span className="motion-preset-focus">
            Found <span className="text-success font-semibold">{data?.pages[0].total_results}</span>{" "}
            {resultLabel} with query{" "}
            <span className="text-warning font-semibold">&quot;{submittedSearchQuery}&quot;</span>
          </span>
        </h5>
        {mode === "people" ? (
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.pages.flatMap((page) =>
              page.kind === "people"
                ? page.results.map((person) => <PersonCard key={person.id} person={person} />)
                : [],
            )}
          </div>
        ) : (
          <div className="movie-grid">
            {data?.pages.flatMap((page) =>
              page.kind === "titles"
                ? page.results.map((result) =>
                    result.type === "movie" ? (
                      <MoviePosterCard
                        key={`${result.type}-${result.id}`}
                        movie={result.data}
                        variant="bordered"
                      />
                    ) : (
                      <TvShowHomeCard
                        key={`${result.type}-${result.id}`}
                        tv={result.data}
                        variant="bordered"
                      />
                    ),
                  )
                : [],
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <SearchFilter
        isLoading={isFetching}
        mode={mode}
        onModeChange={(nextMode) => {
          setMode(nextMode);
          setSubmittedSearchQuery("");
        }}
        onSearchSubmit={(value) => setSubmittedSearchQuery(value.trim())}
      />
      {triggered && (
        <>
          <div className="relative flex flex-col items-center gap-8">
            {isPending ? (
              <Spinner
                size="lg"
                className="absolute-center mt-56"
                color="primary"
                variant="simple"
              />
            ) : (
              renderSearchResults()
            )}
          </div>
          <div ref={ref} className="flex h-24 items-center justify-center">
            {isFetchingNextPage && (
              <Spinner
                color="primary"
                size="lg"
                variant="wave"
                label={getLoadingLabel()}
              />
            )}
            {!isEmpty(data?.pages[0].results) && !hasNextPage && !isPending && (
              <p className="text-muted-foreground text-center text-base">
                You have reached the end of the list.
              </p>
            )}
          </div>
        </>
      )}

      <BackToTopButton />
    </div>
  );
};

export default SearchList;
