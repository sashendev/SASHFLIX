import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { getImageUrl, getReleaseYear, mutateTvShowTitle } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDisclosure, useHover } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { TV } from "tmdb-ts/dist/types";
import { useLongPress } from "use-long-press";
import TvShowHoverCard from "./Hover";
import { VideoCardMenu } from "@/components/ui/button/VideoCardMenu";

interface TvShowPosterCardProps {
  tv: TV;
  variant?: "full" | "bordered";
  /**
   * Playback progress percentage (0‑100). Determines menu state.
   */
  playbackProgress?: number;
  /**
   * History row identifier for removal actions.
   */
  historyId?: number;
}

const TvShowPosterCard: React.FC<TvShowPosterCardProps> = ({
  tv,
  variant = "full",
  playbackProgress = 0,
  historyId,
}) => {
  const { hovered, ref } = useHover();
  const [opened, handlers] = useDisclosure(false);
  const releaseYear = getReleaseYear(tv.first_air_date);
  const posterImage = getImageUrl(tv.poster_path);
  const title = mutateTvShowTitle(tv);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();

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
          content={<TvShowHoverCard id={tv.id} />}
        >
          <Link href={`/tv/${tv.id}`} ref={ref} {...longPress()}>
            {variant === "full" && (
              <div className="group motion-preset-focus hover:border-warning relative aspect-2/3 overflow-hidden rounded-lg border-[3px] border-transparent text-white transition-colors">
                {hovered && (
                  <Icon
                    icon="line-md:play-filled"
                    width="64"
                    height="64"
                    className="absolute-center z-20 text-white"
                  />
                )}
                {tv.adult && (
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
                    <Rating rate={tv.vote_average} />
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
                {/* Video action menu
                   The playbackProgress should be derived from history/ watch‑later data. */}
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
                    {tv.adult && (
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
                  <Rating rate={tv.vote_average} />
                </CardFooter>
              </Card>
            )}
          </Link>
        </Tooltip>
        {variant === "full" && (
          <div className="absolute top-2 right-2 z-20">
            <VideoCardMenu
              data={{
                id: tv.id,
                type: "tv",
                adult: tv.adult,
                backdrop_path: tv.backdrop_path,
                poster_path: tv.poster_path,
                release_date: tv.first_air_date,
                title,
                vote_average: tv.vote_average,
                saved_date: new Date().toISOString(),
              }}
              playbackProgress={playbackProgress}
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
          <TvShowHoverCard id={tv.id} fullWidth />
        </VaulDrawer>
      )}
    </>
  );
};

export default TvShowPosterCard;
