import { ADS_WARNING_STORAGE_KEY, SpacingClasses } from "@/utils/constants";
import { siteConfig } from "@/config/site";
import useBreakpoints from "@/hooks/useBreakpoints";
import { cn } from "@/utils/helpers";
import { mutateMovieTitle } from "@/utils/movies";
import { getMoviePlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { MovieDetails } from "tmdb-ts/dist/types/movies";
import { playerAdapters, usePlayerEvents } from "@/hooks/usePlayerEvents";

const MoviePlayerHeader = dynamic(() => import("./Header"));
const MoviePlayerSourceSelection = dynamic(() => import("./SourceSelection"));

interface MoviePlayerProps {
  movie: MovieDetails;
  startAt?: number;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, startAt }) => {
  const [seen, setSeen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });

  const [isAllFailed, setIsAllFailed] = useState(false);
  const [showAutoSwitchBanner, setShowAutoSwitchBanner] = useState(true);
  const [serverFound, setServerFound] = useState(false);
  const [showNextServerPrompt, setShowNextServerPrompt] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeen(true);
  }, [setSeen]);

  const title = mutateMovieTitle(movie);
  const idle = useIdle(3000);
  const { mobile } = useBreakpoints();
  const [opened, handlers] = useDisclosure(false);
  const [selectedSource, setSelectedSource] = useQueryState<number>(
    "src",
    parseAsInteger.withDefault(0),
  );

  const players = useMemo(() => {
    const basePlayers = getMoviePlayers(movie.id, startAt);
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
  }, [movie.id, startAt]);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedSource, serverFound]);

  useEffect(() => {
    // Build an allowlist of trusted player origins from the registered adapters.
    const trustedPlayerOrigins = Object.values(playerAdapters).map((a) => a.origin);

    const handleMessage = (event: MessageEvent) => {
      // ── Security: validate the message origin ────────────────────────────
      // Only accept messages from:
      //   1. The application's own origin (for PLAYER_FALLBACK from /api/player/fallback)
      //   2. Origins registered in the playerAdapters list
      const ownOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const isTrustedOrigin =
        event.origin === ownOrigin ||
        trustedPlayerOrigins.some((o) => o === event.origin);

      if (!isTrustedOrigin) return;
      // ─────────────────────────────────────────────────────────────────────

      if (serverFound) return;

      if (event.data && event.data.type === "PLAYER_FALLBACK") {
        // Fallback: switch to the next source
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
        // SUCCESS: Stop auto-switching permanently
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

  usePlayerEvents({ saveHistory: true, metadata: { mediaId: movie.id, mediaType: "movie" } });
  useDocumentTitle(`Play ${title} | ${siteConfig.name}`);

  const PLAYER = useMemo(() => players[selectedSource] || players[0], [players, selectedSource]);

  return (
    <>
      {/* AdsWarning removed */}

      <div className={cn("relative", SpacingClasses.reset)}>
        <MoviePlayerHeader
          id={movie.id}
          movieName={title}
          onOpenSource={handlers.open}
          hidden={idle && !mobile}
        />
        <div className="relative h-screen">
          <Card
            shadow="md"
            radius="none"
            className="relative h-full"
          >
            <Skeleton className="absolute h-full w-full" />

            {showAutoSwitchBanner && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs rounded-full border border-white/20 pointer-events-none transition-opacity duration-300 animate-bounce">
                Loading movie...
              </div>
            )}

            {isAllFailed ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-center p-6 text-white">
                <p className="text-xl font-semibold mb-2">Content Not Available</p>
                <p className="text-sm opacity-70">We tried all available servers, but none could load the movie.</p>
                <button
                  onClick={() => {
                    setSelectedSource(0);
                    setIsAllFailed(false);
                    setServerFound(false);
                    setShowNextServerPrompt(false);
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
                          This server may be slow or temporarily unavailable.
                          You can keep waiting or try another server.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                          <button
                            onClick={() => setShowNextServerPrompt(false)}
                            className="rounded-lg border border-zinc-600 px-4 py-2 hover:bg-zinc-800 transition-colors"
                          >
                            Keep Watcing
                          </button>
                          <button
                            onClick={() => {
                              setShowNextServerPrompt(false);
                              setServerFound(false);
                              setShowAutoSwitchBanner(true);

                              const nextSource = selectedSource + 1;

                              if (nextSource < players.length) {
                                setSelectedSource(nextSource);
                              } else {
                                setIsAllFailed(true);
                              }
                            }}
                            className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700 transition-colors"
                          >
                            Try Next Server
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
      </div>

      <MoviePlayerSourceSelection
        opened={opened}
        onClose={handlers.close}
        players={players}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
      />
    </>
  );
};

MoviePlayer.displayName = "MoviePlayer";

export default MoviePlayer;
