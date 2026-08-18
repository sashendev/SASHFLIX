import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { getImageUrl, getReleaseYear, mutateMovieTitle } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDisclosure, useHover } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { Movie } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import HoverPosterCard from "./Hover";
import { VideoCardMenu } from "@/components/ui/button/VideoCardMenu";

interface MoviePosterCardProps {
  movie: Movie;
  variant?: "full" | "bordered";
  /**
   * Playback progress percentage (0-100). Used by VideoCardMenu to show state‑aware actions.
   */
  playbackProgress?: number;
  /**
   * History row identifier – required for removing an entry from the history via the three‑dot menu.
   */
  historyId?: number;
}

const MoviePosterCard: React.FC<MoviePosterCardProps> = ({
  movie,
  variant = "full",
  playbackProgress = 0,
  historyId,
}) => {
  const { hovered, ref } = useHover();
  const [opened, handlers] = useDisclosure(false);
  const releaseYear = getReleaseYear(movie.release_date);
  const posterImage = getImageUrl(movie.poster_path);
  const title = mutateMovieTitle(movie);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();

  // Use provided playbackProgress (default 0) – callers such as ContinueWatching or History will supply actual values.
  const progress = playbackProgress;

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, []);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  return (
    <>
      <div className="relative">
        <Tooltip
          isDisabled={mobile}
          showArrow
          className="bg-secondary-background p-0"
          shadow="lg"
          delay={1000}
          placement="right-start"
          content={<HoverPosterCard id={movie.id} />}
        >
          <Link href={`/movie/${movie.id}`} ref={ref} {...longPress()}>
            {variant === "full" && (
              <div className="group motion-preset-focus hover:border-primary relative aspect-2/3 overflow-hidden rounded-lg border-[3px] border-transparent text-white transition-colors">
                {hovered && (
                  <Icon
                    icon="line-md:play-filled"
                    width="64"
                    height="64"
                    className="absolute-center z-20 text-white"
                  />
                )}
                {movie.adult && (
                  <Chip
                    color="danger"
                    size="sm"
                    variant="flat"
                    className="absolute top-2 left-2 z-20"
                  >
                    18+
                  </Chip>
                )}
                <div className="absolute bottom-0 z-2 h-1/2 w-full bg-linear-to-t from-black from-1%"></div>
                <div className="absolute bottom-0 z-3 flex w-full flex-col gap-1 px-4 py-3">
                  <h6 className="truncate text-sm font-semibold">{title}</h6>
                  <div className="flex justify-between text-xs">
                    <p>{releaseYear}</p>
                    <Rating rate={movie?.vote_average} />
                  </div>
                </div>
                <Image
                  alt={title}
                  src={posterImage}
                  radius="none"
                  className="z-0 aspect-2/3 h-[250px] object-cover object-center transition group-hover:scale-110 md:h-[300px]"
                  classNames={{
                    img: "group-hover:opacity-70",
                  }}
                />
                {/* Three‑dot menu for video actions */}
              </div>
            )}

            {variant === "bordered" && (
              <Card
                isHoverable
                fullWidth
                shadow="md"
                className="group bg-secondary-background h-full"
              >
                <CardHeader className="flex items-center justify-center pb-0">
                  <div className="relative size-full">
                    {hovered && (
                      <Icon
                        icon="line-md:play-filled"
                        width="64"
                        height="64"
                        className="absolute-center z-20 text-white"
                      />
                    )}
                    {movie.adult && (
                      <Chip
                        color="danger"
                        size="sm"
                        variant="shadow"
                        className="absolute top-2 left-2 z-20"
                      >
                        18+
                      </Chip>
                    )}
                    <div className="rounded-large relative overflow-hidden">
                      <Image
                        isBlurred
                        alt={title}
                        className="aspect-2/3 rounded-lg object-cover object-center group-hover:scale-110"
                        src={posterImage}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="justify-end pb-1">
                  <p className="text-md truncate font-bold">{title}</p>
                </CardBody>
                <CardFooter className="justify-between pt-0 text-xs">
                  <p>{releaseYear}</p>
                  <Rating rate={movie.vote_average} />
                </CardFooter>
              </Card>
            )}
          </Link>
        </Tooltip>
        {variant === "full" && (
          <div className="absolute top-2 right-2 z-20">
            <VideoCardMenu
              data={{
                id: movie.id,
                type: "movie",
                adult: movie.adult,
                backdrop_path: movie.backdrop_path,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                title,
                vote_average: movie.vote_average,
                saved_date: new Date().toISOString(),
              }}
              playbackProgress={progress}
              historyId={historyId}
            />
          </div>
        )}
      </div>

      {mobile && (
        <VaulDrawer
          backdrop="blur"
          open={opened}
          onOpenChange={handlers.toggle}
          title={title}
          hiddenTitle
        >
          <HoverPosterCard id={movie.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};
export default MoviePosterCard;
