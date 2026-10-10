"use client";

import { tmdb } from "@/api/tmdb";
import MoviePosterCard from "@/components/sections/Movie/Cards/Poster";
import TvShowPosterCard from "@/components/sections/TV/Cards/Poster";
import SectionTitle from "@/components/ui/other/SectionTitle";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import { getImageUrl } from "@/utils/movies";
import { Image, Spinner } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { use } from "react";
import { Params } from "@/types";
import { Movie, TV } from "tmdb-ts/dist/types";

type FilmographyItem =
  | { id: number; type: "movie"; data: Movie }
  | { id: number; type: "tv"; data: TV };

const PersonPage: React.FC<Params<{ id: number }>> = ({ params }) => {
  const { id } = use(params);
  const { data, isPending, error } = useQuery({
    queryKey: ["person-filmography", id],
    queryFn: async () => {
      const [person, credits] = await Promise.all([
        tmdb.people.details(id),
        Promise.all([tmdb.people.movieCredits(id), tmdb.people.tvShowCredits(id)]),
      ]);
      return { person, movieCredits: credits[0], tvCredits: credits[1] };
    },
  });

  if (isPending) return <Spinner size="lg" className="absolute-center" variant="simple" />;
  if (error) notFound();

  const movieFilmography: FilmographyItem[] = Array.from(
    new Map(
      data.movieCredits.cast.map((movie) => [
        movie.id,
        { id: movie.id, type: "movie", data: movie } as const,
      ]),
    ).values(),
  );
  const tvFilmography: FilmographyItem[] = Array.from(
    new Map(
      data.tvCredits.cast.map((show) => [
        show.id,
        {
          id: show.id,
          type: "tv",
          data: { ...show, adult: "adult" in show ? Boolean(show.adult) : false },
        } as const,
      ]),
    ).values(),
  );
  const filmography = [...movieFilmography, ...tvFilmography].sort((a, b) => {
    const aDate =
      a.type === "movie" ? a.data.release_date : a.data.first_air_date;
    const bDate =
      b.type === "movie" ? b.data.release_date : b.data.first_air_date;
    return (
      (bDate ? new Date(bDate).getTime() : 0) - (aDate ? new Date(aDate).getTime() : 0) ||
      b.data.popularity - a.data.popularity
    );
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <section className="bg-secondary-background flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-start">
        <Image
          src={getImageUrl(data.person.profile_path, "avatar")}
          alt={data.person.name}
          className="mx-auto max-h-72 w-48 object-cover sm:mx-0"
          classNames={{ wrapper: "shrink-0" }}
        />
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-3xl font-bold">{data.person.name}</h1>
          <p className="text-muted-foreground">{data.person.known_for_department}</p>
          {data.person.biography && (
            <p className="whitespace-pre-line leading-relaxed">{data.person.biography}</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <SectionTitle>Movies &amp; TV Shows</SectionTitle>
        {filmography.length ? (
          <div className="movie-grid">
            {filmography.map((item) => (
              item.type === "movie" ? (
                <MoviePosterCard
                  key={`${item.type}-${item.id}`}
                  movie={item.data}
                  variant="bordered"
                />
              ) : (
                <TvShowPosterCard
                  key={`${item.type}-${item.id}`}
                  tv={item.data}
                  variant="bordered"
                />
              )
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            No movies or TV shows found for this person.
          </p>
        )}
      </section>
      <BackToTopButton />
    </div>
  );
};

export default PersonPage;
