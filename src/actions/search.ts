"use server";

import { tmdb } from "@/api/tmdb";
import { ActionResponse } from "@/types";
import { isEmpty } from "@/utils/helpers";

export type SearchSuggestion = {
  id: number;
  title: string;
  type: "movie" | "tv" | "person";
};

export type SearchMode = "titles" | "people";

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

const getSuggestionsForQuery = async (query: string, mode: SearchMode) => {
  if (mode === "people") {
    return (await tmdb.search.people({ query, page: 1 })).results.map((person) => ({
      id: person.id,
      title: person.name,
      type: "person" as const,
    }));
  }

  const [movies, tvShows] = await Promise.all([
    tmdb.search.movies({ query, page: 1 }),
    tmdb.search.tvShows({ query, page: 1 }),
  ]);

  return [
    ...movies.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      type: "movie" as const,
    })),
    ...tvShows.results.map((tv) => ({
      id: tv.id,
      title: tv.name,
      type: "tv" as const,
    })),
  ];
};

export const getSearchSuggestions = async (
  query: string,
  limit: number = 10,
  mode: SearchMode = "titles",
): Promise<ActionResponse<SearchSuggestion[] | null>> => {
  try {
    if (isEmpty(query)) {
      return {
        success: true,
        message: "No search suggestions",
        data: null,
      };
    }

    const suggestions: SearchSuggestion[] = await getSuggestionsForQuery(query, mode);
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
      return {
        success: true,
        message: "No search suggestions",
        data: null,
      };
    }

    let filteredSuggestions = suggestions.filter((suggestion) =>
      normalizeSearchText(suggestion.title).includes(normalizedQuery),
    );

    if (isEmpty(filteredSuggestions)) {
      const alternateQuery = query.replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
      if (alternateQuery && alternateQuery.toLowerCase() !== query.trim().toLowerCase()) {
        const alternateSuggestions = await getSuggestionsForQuery(alternateQuery, mode);
        filteredSuggestions = alternateSuggestions.filter((suggestion) =>
          normalizeSearchText(suggestion.title).includes(normalizedQuery),
        );
      }
    }

    if (isEmpty(filteredSuggestions)) {
      return {
        success: true,
        message: "No search suggestions",
        data: null,
      };
    }

    const uniqueSuggestions = filteredSuggestions
      .filter(
        (data, index, self) =>
          index ===
          self.findIndex(
            (candidate) =>
              candidate.type === data.type &&
              candidate.id === data.id,
          ),
      );

    const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
      const aTitle = normalizeSearchText(a.title);
      const bTitle = normalizeSearchText(b.title);

      const aStartsWith = aTitle.startsWith(normalizedQuery);
      const bStartsWith = bTitle.startsWith(normalizedQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      const aIndex = aTitle.indexOf(normalizedQuery);
      const bIndex = bTitle.indexOf(normalizedQuery);

      if (aIndex !== bIndex) return aIndex - bIndex;
      return aTitle.localeCompare(bTitle);
    });

    return {
      success: true,
      message: "Search suggestions fetched",
      data: sortedSuggestions.slice(0, limit),
    };
  } catch (error) {
    console.error("Search suggestions error:", error);

    return {
      success: false,
      message: "Error fetching search suggestions",
      data: null,
    };
  }
};
