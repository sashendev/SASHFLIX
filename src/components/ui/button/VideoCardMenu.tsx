"use client";

import { useEffect, useState, useTransition } from "react";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { checkInWatchlist, addToWatchlist, removeFromWatchlist } from "@/actions/library";
import { deleteHistory } from "@/actions/histories";
import { SavedMovieDetails } from "@/types/movie";
import { usePathname } from "next/navigation";
import { queryClient } from "@/app/providers";

interface VideoCardMenuProps {
  data: SavedMovieDetails;
  isInWatchLater?: boolean;
  playbackProgress?: number; // 0-100
  isDuration?: number; // in seconds
  onPlayClick?: () => void;
  historyId?: number; // Required for deletion from history
}

type VideoState = "new" | "watching" | "completed" | "saved";

export const VideoCardMenu: React.FC<VideoCardMenuProps> = ({
  data,
  isInWatchLater: initialIsWatchLater,
  playbackProgress = 0,
  isDuration,
  onPlayClick,
  historyId,
}) => {
  const pathname = usePathname();
  const { data: user } = useSupabaseUser();
  const [isPending, startTransition] = useTransition();
  const [isInWatchLater, setIsInWatchLater] = useState(initialIsWatchLater || false);
  const [videoState, setVideoState] = useState<VideoState>("new");

  // Determine video state based on progress
  useEffect(() => {
    if (!playbackProgress) {
      setVideoState("new");
    } else if (playbackProgress >= 90) {
      setVideoState("completed");
    } else if (playbackProgress > 0) {
      setVideoState("watching");
    } else {
      setVideoState("new");
    }
  }, [playbackProgress]);

  // Check if in watchlist on mount
  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      try {
        const result = await checkInWatchlist(data.id, data.type);
        if (result.success) {
          setIsInWatchLater(result.isInWatchlist);
        }
      } catch (error) {
        console.error("Error checking watch later status:", error);
      }
    };

    checkStatus();
  }, [user, data.id, data.type]);

  const handleAddToWatchLater = () => {
    if (!user) {
      addToast({
        title: "You must be logged in",
        color: "warning",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await addToWatchlist({
          id: data.id,
          type: data.type,
          adult: data.adult,
          backdrop_path: data.backdrop_path,
          poster_path: data.poster_path || null,
          release_date: data.release_date,
          title: data.title,
          vote_average: data.vote_average,
        });

        if (result.success) {
          setIsInWatchLater(true);
          addToast({
            title: "Added to Watch Later",
            color: "success",
          });
        } else {
          addToast({
            title: "Error",
            description: result.error,
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to add to watch later",
          color: "danger",
        });
      }
    });
  };

  const handleRemoveFromWatchLater = () => {
    startTransition(async () => {
      try {
        const result = await removeFromWatchlist(data.id, data.type);

        if (result.success) {
          setIsInWatchLater(false);
          addToast({
            title: "Removed from Watch Later",
            color: "success",
          });
          if (pathname === "/watch-later") {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
          }
        } else {
          addToast({
            title: "Error",
            description: result.error,
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to remove from watch later",
          color: "danger",
        });
      }
    });
  };

  const handleRemoveFromHistory = () => {
    if (!historyId) return;

    startTransition(async () => {
      try {
        const result = await deleteHistory(historyId);

        if (result.success) {
          addToast({
            title: "Removed from History",
            color: "success",
          });
          queryClient.invalidateQueries({ queryKey: ["history"] });
        } else {
          addToast({
            title: "Error",
            description: result.message,
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Failed to remove from history",
          color: "danger",
        });
      }
    });
  };

  const menuItems: Array<{
    key: string;
    label: string;
    icon?: string;
    color?: string;
    action?: () => void;
  }> = [];

  // State-aware menu items
  if (videoState === "new") {
    menuItems.push({
      key: "play",
      label: "Play",
      icon: "solar:play-circle-bold",
      color: "primary",
      action: onPlayClick,
    });
    menuItems.push({
      key: "add-watch-later",
      label: "Add to Watch Later",
      icon: "mdi:plus",
      action: handleAddToWatchLater,
    });
  } else if (videoState === "watching") {
    menuItems.push({
      key: "continue",
      label: `Continue (${Math.round(playbackProgress)}%)`,
      icon: "mdi:play",
      color: "warning",
      action: onPlayClick,
    });
    menuItems.push({
      key: "start-over",
      label: "Start Over",
      icon: "mdi:restart",
      action: onPlayClick,
    });
    if (!isInWatchLater) {
      menuItems.push({
        key: "add-watch-later",
        label: "Add to Watch Later",
        icon: "mdi:plus",
        action: handleAddToWatchLater,
      });
    } else {
      menuItems.push({
        key: "remove-watch-later",
        label: "Remove from Watch Later",
        icon: "mdi:minus",
        action: handleRemoveFromWatchLater,
      });
    }
  } else if (videoState === "completed") {
    menuItems.push({
      key: "watch-again",
      label: "Watch Again",
      icon: "mdi:replay",
      color: "success",
      action: onPlayClick,
    });
    if (!isInWatchLater) {
      menuItems.push({
        key: "add-watch-later",
        label: "Add to Watch Later",
        icon: "mdi:plus",
        action: handleAddToWatchLater,
      });
    } else {
      menuItems.push({
        key: "remove-watch-later",
        label: "Remove from Watch Later",
        icon: "mdi:minus",
        action: handleRemoveFromWatchLater,
      });
    }
    if (historyId && pathname === "/history") {
      menuItems.push({
        key: "remove-history",
        label: "Remove from History",
        icon: "mdi:trash",
        color: "danger",
        action: handleRemoveFromHistory,
      });
    }
  }

  menuItems.push({
    key: "view-details",
    label: "View Details",
    icon: "mdi:information",
    action: () => {
      // This would navigate to details, handled by parent component
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="flat" size="sm">
            <Icon icon="mdi:dots-vertical" fontSize={20} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Video actions"
          items={menuItems}
          onAction={(key) => {
            const item = menuItems.find((m) => m.key === key);
            if (item && item.action) {
              item.action();
            }
          }}
        >
          {(item: any) => (
            <DropdownItem
              key={item.key}
              textValue={item.label}
              color={item.color || "default"}
              startContent={<Icon icon={item.icon} fontSize={18} />}
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
