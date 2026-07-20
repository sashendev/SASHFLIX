import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { getTvShowPlayers } from "@/utils/players";
import { Card, Skeleton } from "@heroui/react";
import { useDisclosure, useDocumentTitle, useIdle, useLocalStorage } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { parseAsInteger, useQueryState } from "nuqs";
import { memo, useEffect, useMemo } from "react";
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
  }, [id, episode.season_number, episode.episode_number, startAt]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PLAYER_FALLBACK") {
        const next = event.data.nextSource;
        if (typeof next === "number" && next < players.length) {
          setSelectedSource(next);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [players.length, setSelectedSource]);

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
          {seen && (
            <iframe
              allowFullScreen
              key={PLAYER.title}
              src={PLAYER.source}
              className={cn("z-10 h-full", { "pointer-events-none": idle && !mobile })}
            />
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
