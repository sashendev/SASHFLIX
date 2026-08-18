"use client";

import { getUserHistories } from "@/actions/histories";
import { queryClient } from "@/app/providers";
import SectionTitle from "@/components/ui/other/SectionTitle";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ChevronDown } from "@/utils/icons";
import { Button, Image, Progress, Spinner } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useState } from "react";
import { deleteHistory } from "@/actions/histories";
import { cn } from "@/utils/helpers";
import { formatDuration, getImageUrl, getReleaseYear, timeAgo } from "@/utils/movies";
import Rating from "@/components/ui/other/Rating";

const ContinueWatchingLibrary: React.FC = () => {
  const { content } = useDiscoverFilters();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryFn: () => getUserHistories(50),
    queryKey: ["continue-watching-library"],
  });

  const filteredData = useCallback(() => {
    if (!data?.data) return [];
    // Filter by content type (movie or tv)
    return data.data.filter((item) => item.type === content);
  }, [data, content]);

  const handleRemoveHistory = useCallback(
    async (historyId: number) => {
      setDeletingIds((prev) => new Set([...prev, historyId]));

      // Optimistic update
      queryClient.setQueryData(
        ["continue-watching-library"],
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.filter((item: any) => item.id !== historyId),
          };
        },
      );

      await deleteHistory(historyId);
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(historyId);
        return newSet;
      });
    },
    [queryClient],
  );

  const items = filteredData();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="sm" color="current" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-lg border border-default-200 bg-default-50 p-6 dark:bg-default-100/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between transition-opacity hover:opacity-80"
      >
        <div className="flex items-center gap-3">
          <SectionTitle
            className="m-0"
            color={content === "movie" ? "primary" : "warning"}
          >
            Continue Watching
          </SectionTitle>
          <span className="text-sm text-default-500">({items.length})</span>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            !isExpanded && "-rotate-90",
          )}
        />
      </button>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((media) => {
            const releaseYear = getReleaseYear(media.release_date);
            const posterImage = getImageUrl(media.backdrop_path || media.poster_path || "");
            const isDeleting = deletingIds.has(media.id);

            const redirectLink =
              media.type === "movie"
                ? `/movie/${media.media_id}/player`
                : `/tv/${media.media_id}/${media.season}/${media.episode}/player`;

            return (
              <Link key={media.id} href={redirectLink}>
                <div
                  className={cn(
                    "group relative aspect-video overflow-hidden rounded-lg transition-opacity",
                    isDeleting && "opacity-50",
                  )}
                >
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                      <svg
                        className="h-5 w-5 fill-white text-white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveHistory(media.id);
                    }}
                    disabled={isDeleting}
                    className="absolute right-1 top-1 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 opacity-100 backdrop-blur-xs transition-opacity hover:bg-red-600/70 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
                    title="Remove from continue watching"
                  >
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Progress bar */}
                  <Progress
                    size="sm"
                    radius="md"
                    aria-label="Watch progress"
                    className="absolute bottom-0 z-10 w-full"
                    color={media.type === "movie" ? "primary" : "warning"}
                    value={
                      media.duration > 0 ? (media.last_position / media.duration) * 100 : 0
                    }
                  />

                  {/* Gradient overlay */}
                  <div className="absolute bottom-0 z-5 h-1/3 w-full bg-linear-to-t from-black/80 from-10%" />

                  {/* Info overlay */}
                  <div className="absolute bottom-0 z-8 w-full p-1.5">
                    <p className="truncate text-xs font-semibold text-white">
                      {media.title}
                    </p>
                    <div className="flex items-center justify-between gap-1 text-xs text-default-300">
                      <span>{releaseYear}</span>
                      {media.duration > 0 && (
                        <span>{formatDuration(media.last_position)}</span>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  <Image
                    alt={media.title}
                    src={posterImage}
                    radius="none"
                    className="z-0 aspect-video h-full object-cover object-center transition group-hover:scale-110"
                    classNames={{
                      img: "group-hover:opacity-70",
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContinueWatchingLibrary;
