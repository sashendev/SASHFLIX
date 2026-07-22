import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Episode, TvShowDetails } from "tmdb-ts";
import useBreakpoints from "@/hooks/useBreakpoints";
import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { usePlayerEvents } from "@/hooks/usePlayerEvents";

const TvShowPlayerHeader = dynamic(() => import("./Header"));
const TvShowPlayerSourceSelection = dynamic(() => import("./SourceSelection"));
const TvShowPlayerEpisodeSelection = dynamic(() => import("./EpisodeSelection"));

export interface TvShowPlayerProps {
  tv: TvShowDetails;
  id: number;
  seriesName: string;
  seasonName: string;
  episode: Episode;
  episodes: Episode[];
  nextEpisodeNumber: number | null;
  prevEpisodeNumber: number | null;
  startAt?: number;
}

const TvShowPlayer: React.FC<TvShowPlayerProps> = ({
  tv,
  id,
  episode,
  episodes,
  startAt,
  ...props
}) => {
  const [seen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const [isAllFailed, setIsAllFailed] = useState(false);
  const [showAutoSwitchBanner, setShowAutoSwitchBanner] = useState(true);
  const [serverFound, setServerFound] = useState(false);
  const [showNextServerPrompt, setShowNextServerPrompt] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mobile } = useBreakpoints();
  const idle = useIdle(3000);
  const [sourceOpened, sourceHandlers] = useDisclosure(false);
  const [episodeOpened, episodeHandlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  const players = useMemo(() => {
    const basePlayers = getTvShowPlayers(id, episode.season_number, episode.episode_number, startAt);
    if (typeof window !== "undefined") {
      return basePlayers.map((player, index) => {
        if (player.source.includes("vidlink.pro")) {
          const fallbackUrl = `${window.location.origin}/api/player/fallback?nextSource=${index + 1}`;
          const separator = player.source.includes("?") ? "&" : "?";
          return {
            ...player,
            source: `${player.source}${separator}fallback_url=${encodeURIComponent(fallbackUrl)}` as `https://${string}`,
          };
        }
        return player;
      });
    }
    return basePlayers;
  }, [id, episode.season_number, episode.episode_number, startAt]);

  useEffect(() => {
    setShowNextServerPrompt(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!serverFound) {
        setShowNextServerPrompt(true);
      }
    }, 20000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedSource, serverFound]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (serverFound) return;
      if (event.data && event.data.type === "PLAYER_FALLBACK") {
        const next = event.data.nextSource;
        if (typeof next === "number" && next < players.length) {
          setSelectedSource(next);
        }
      } else if (
        event.data &&
        (
          event.data.type === "ready" ||
          event.data.type === "playing" ||
          event.data.status === "success" ||
          event.data.event === "play" ||
          event.data.state === "playing"
        )
      ) {
        setServerFound(true);
        setShowAutoSwitchBanner(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [players.length, setSelectedSource, serverFound]);

  usePlayerEvents({
    saveHistory: true,
    metadata: { season: episode.season_number, episode: episode.episode_number },
  });

  useDocumentTitle(
    `Play ${props.seriesName} - ${props.seasonName} - ${episode.name} | ${siteConfig.name}`,
  );

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);

  return (
    <>
      {/* AdsWarning removed */}

      <div className={cn("relative", SpacingClasses.reset)}>
        <TvShowPlayerHeader
          id={id}
          episode={episode}
          hidden={idle && !mobile}
          selectedSource={selectedSource}
          onOpenSource={sourceHandlers.open}
          onOpenEpisode={episodeHandlers.open}
          {...props}
        />

        <Card shadow="md" radius="none" className="relative h-screen">
          <Skeleton className="absolute h-full w-full" />

          {showAutoSwitchBanner && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs rounded-full border border-white/20 pointer-events-none transition-opacity duration-300 animate-bounce">
              Loading episode...
            </div>
          )}

          {isAllFailed ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-center p-6 text-white">
              <p className="text-xl font-semibold mb-2">Content Not Available</p>
              <p className="text-sm opacity-70">We tried all available servers, but none could load the episode.</p>
              <button
                onClick={() => {
                  setSelectedSource(0);
                  setIsAllFailed(false);
                  setServerFound(false);
                  setShowAutoSwitchBanner(true);
                }}
                className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            seen && (
              <>
                <iframe
                  allowFullScreen
                  key={PLAYER.title}
                  src={PLAYER.source}
                  className={cn("z-10 h-full w-full", { "pointer-events-none": idle && !mobile })}
                />

                {showNextServerPrompt && !serverFound && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70">
                    <div className="w-[380px] rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl pointer-events-auto">
                      <h3 className="text-lg font-semibold">
                        Still loading?
                      </h3>
                      <p className="mt-2 text-sm text-gray-300">
                        This may happen because of a slow internet connection or a temporary issue with this server.
                      </p>
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={() => setShowNextServerPrompt(false)}
                          className="rounded-lg border border-zinc-600 px-4 py-2 hover:bg-zinc-800 transition-colors"
                        >
                          Keep Watching
                        </button>
                        <button
                          onClick={() => {
                            setShowNextServerPrompt(false);
                            setServerFound(false);
                            setShowAutoSwitchBanner(true);

                            const next = selectedSource + 1;
                            if (next < players.length) {
                              setSelectedSource(next);
                            } else {
                              setIsAllFailed(true);
                            }
                          }}
                          className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700 transition-colors"
                        >
                          Try {players[selectedSource + 1] ? players[selectedSource + 1].title : "Again"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </Card>
      </div>

      <TvShowPlayerSourceSelection
        opened={sourceOpened}
        onClose={sourceHandlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
      <TvShowPlayerEpisodeSelection
        id={id}
        opened={episodeOpened}
        onClose={episodeHandlers.close}
        episodes={episodes}
      />
    </>
  );
};

export default memo(TvShowPlayer);