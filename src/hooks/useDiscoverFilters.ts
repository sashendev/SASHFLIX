import { queryClient as q } from "@/app/providers";
import { siteConfig } from "@/config/site";
import { DISCOVER_MOVIES_VALID_QUERY_TYPES, DISCOVER_TVS_VALID_QUERY_TYPES } from "@/types/movie";
import { parseAsSet } from "@/utils/parsers";
import { useQueryState, parseAsStringLiteral, parseAsString } from "nuqs";
import { useCallback, useMemo, useEffect } from "react";

const VALID_CONTENT_TYPES = ["movie", "tv"] as const;
const DEFAULT_QUERY_TYPE = "discover";

const useDiscoverFilters = () => {
  const { movies, tvShows } = siteConfig.queryLists;

  const [genres, setGenres] = useQueryState("genres", parseAsSet.withDefault(new Set([])));
  const [language, setLanguage] = useQueryState("language", parseAsString.withDefault(""));
  const [queryType, setQueryType] = useQueryState(
    "type",
    parseAsStringLiteral([
      ...DISCOVER_MOVIES_VALID_QUERY_TYPES,
      ...DISCOVER_TVS_VALID_QUERY_TYPES,
    ]).withDefault(DEFAULT_QUERY_TYPE),
  );
  const [content, setContent] = useQueryState(
    "content",
    parseAsStringLiteral(VALID_CONTENT_TYPES).withDefault("movie"),
  );

  const types = useMemo(
    () => [
      { name: "Discover", key: DEFAULT_QUERY_TYPE },
      ...(content === "movie" ? movies : tvShows).map(({ name, param }) => ({
        name: name.replace(/(Movies|TV Shows)/g, "").trim(),
        key: param,
      })),
    ],
    [content, movies, tvShows],
  );

  const genresString = useMemo(
    () =>
      Array.from(genres)
        .filter((genre) => genre !== "")
        .join(","),
    [genres],
  );

  const resetFilters = useCallback(() => {
    setGenres(null);
    setLanguage("");
    setQueryType(DEFAULT_QUERY_TYPE);
  }, [setGenres, setLanguage, setQueryType]);

  const clearQueries = useCallback(() => {
    const queryKeys = ["discover-movies", "discover-tv-shows"];
    queryKeys.forEach((key) => {
      if (!q.isFetching({ queryKey: [key] })) {
        q.removeQueries({ queryKey: [key] });
      }
    });
  }, []);

  useEffect(() => {
    clearQueries();
  }, [content, queryType, genresString, language, clearQueries]);

  return {
    types,
    genres,
    language,
    queryType,
    content,
    genresString,
    setGenres,
    setLanguage,
    setQueryType,
    setContent,
    resetFilters,
  };
};

export default useDiscoverFilters;
