"use client";

import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import type { IconifyIcon } from "@iconify/react";
import { tmdb } from "@/api/tmdb";
import { SidebarExpandable } from "./SidebarExpandable";
import { SidebarLink } from "./SidebarLink";
import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";

const INITIAL_CATEGORIES_COUNT = 8;

export const CategoryList: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const { content } = useDiscoverFilters();

  const movieGenres = useQuery({
    queryFn: () => tmdb.genres.movies(),
    queryKey: ["genres", "movie"],
    staleTime: 1000 * 60 * 60,
  });

  const tvGenres = useQuery({
    queryFn: () => tmdb.genres.tvShows(),
    queryKey: ["genres", "tv"],
    staleTime: 1000 * 60 * 60,
  });

  const genres =
    content === "tv"
      ? (tvGenres.data?.genres || [])
      : (movieGenres.data?.genres || []);

  const isLoading = content === "tv" ? tvGenres.isPending : movieGenres.isPending;
  const displayedGenres = showAll ? genres : genres.slice(0, INITIAL_CATEGORIES_COUNT);

  // Map each genre to a unique, professional Iconify icon.
  const categoryIcons: { [key: string]: IconifyIcon | string } = {
    Action: "mdi:sword-cross",
    Adventure: "mdi:treasure-chest",
    Animation: "mdi:animation-play",
    Comedy: "mdi:emoticon-excited",
    Crime: "mdi:fingerprint",
    Documentary: "mdi:video-vintage",
    Drama: "mdi:drama-masks",
    Family: "mdi:account-group",
    Fantasy: "mdi:creation",
    History: "mdi:book-open-variant",
    Horror: "mdi:skull",
    Music: "mdi:music-note",
    Mystery: "mdi:help-box",
    Romance: "mdi:heart-pulse",
    "Science Fiction": "mdi:atom",
    "TV Movie": "mdi:cast-connected",
    Thriller: "mdi:flash-alert",
    War: "mdi:shield-sword",
    Western: "mdi:hat-fedora",
    Kids: "mdi:puzzle",
    News: "mdi:newspaper",
    Reality: "mdi:account-group",
    "Sci-Fi & Fantasy": "mdi:atom",
    Soap: "mdi:heart-multiple",
    Talk: "mdi:forum-outline",
    "War & Politics": "mdi:shield-sword",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <SidebarExpandable
      icon={<Icon icon="mdi:compass" width={22} height={22} />}
      label="Discover"
      routeHref="/discover"
      defaultOpen={true}
    >
      <div className="flex flex-col gap-1">
        {displayedGenres.map((genre) => (
          <SidebarLink
            key={genre.id}
            href={`/discover?content=${content}&genres=${genre.id}`}
            icon={
              <Icon
                icon={categoryIcons[genre.name] ?? "mdi:movie"}
                width={20}
                height={20}
              />
            }
            label={genre.name}
          />
        ))}
      </div>

      {genres.length > INITIAL_CATEGORIES_COUNT && (
        <Button
            size="sm"
            className="mt-2"
            onPress={() => setShowAll(!showAll)}
            variant="light"
          >
            {showAll ? "Show Less <" : "> Show More"}
          </Button>
      )}
    </SidebarExpandable>
  );
};
