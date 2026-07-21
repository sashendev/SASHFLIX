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
import { usePlayerEvents } from "@/hooks/usePlayerEvents";
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
  const userInteractedRef = useRef(false);
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
        if (player.title.startsWith("VidLink")) {
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
    // Stop everything if a working server was already found
    if (serverFound) return;

    // Cancel any existing timeout when source changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset interaction flag when source changes
    userInteractedRef.current = false;
    setShowAutoSwitchBanner(true);

    // Start pessimistic timeout: assume failure after 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (serverFound || userInteractedRef.current) {
        return;
      }

      console.log(`Timeout reached for source ${selectedSource}. Switching to next...`);
      const nextSource = selectedSource + 1;
      if (nextSource < players.length) {
        setSelectedSource(nextSource);
      } else {
        setIsAllFailed(true);
        setShowAutoSwitchBanner(false);
      }
    }, 10000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedSource, players, setSelectedSource, serverFound]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Log messages to help debug which events the players are actually sending
      console.log("Player Message Received:", event.data);

      if (serverFound) return;

      if (event.data && event.data.type === "PLAYER_FALLBACK") {
        // Existing fallback logic
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
        console.log("WORKING SERVER FOUND: Stopping auto-switch.");
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

  usePlayerEvents({ saveHistory: true });
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
        <div 
          className="relative h-screen" 
          onClickCapture={() => {
            console.log("CLICK DETECTED: Locking player now!");
            userInteractedRef.current = true;
            setServerFound(true);
            setShowAutoSwitchBanner(false);
          }}
        >
          <Card 
            shadow="md" 
            radius="none" 
            className="relative h-full"
          >
            <Skeleton className="absolute h-full w-full" />
            
            {showAutoSwitchBanner && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-black/60 backdrop-blur-md text-white text-xs rounded-full border border-white/20 pointer-events-none transition-opacity duration-300 animate-bounce">
                Searching for working server... Please wait.
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
                  }}
                  className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              seen && (
                <iframe
                  allowFullScreen
                  key={PLAYER.title}
                  src={PLAYER.source}
                  className={cn("z-10 h-full", { "pointer-events-none": idle && !mobile })}
                />
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
