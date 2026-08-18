import { tmdb } from "@/api/tmdb";
import { SiteConfigType } from "@/types";
import { Icon } from "@iconify/react";
import { GoHomeFill, GoHome } from "react-icons/go";
import { HiComputerDesktop } from "react-icons/hi2";
import { IoIosSunny } from "react-icons/io";
import {
  IoInformationCircle,
  IoInformationCircleOutline,
  IoMoon,
} from "react-icons/io5";
import { TbClock, TbClockFilled } from "react-icons/tb";
import { TbHistory } from "react-icons/tb";

export const siteConfig: SiteConfigType = {
  name: "SASHFLIX",
  description: "Your best choice for a free movies and tv shows streaming website.",
  favicon: "/favicon.ico",
  navItems: [
    {
      label: "Home",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "Discover",
      href: "/discover",
      icon: <Icon icon="mdi:compass-outline" className="size-full" />,
      activeIcon: <Icon icon="mdi:compass" className="size-full" />,
    },
    {
      label: "History",
      href: "/history",
      icon: <TbHistory className="size-full" />,
      activeIcon: <TbHistory className="size-full" />,
    },
    {
      label: "Continue Watching",
      href: "/continue-watching",
      icon: <Icon icon="mdi:play-circle-outline" className="size-full" />,
      activeIcon: <Icon icon="mdi:play-circle" className="size-full" />,
    },
    {
      label: "Watch Later",
      href: "/watch-later",
      icon: <TbClock className="size-full" />,
      activeIcon: <TbClockFilled className="size-full" />,
    },
    {
      label: "You",
      href: "/you",
      icon: <Icon icon="mdi:account-circle-outline" className="size-full" />,
      activeIcon: <Icon icon="mdi:account-circle" className="size-full" />,
    },
    {
      label: "About",
      href: "/about",
      icon: <IoInformationCircleOutline className="size-full" />,
      activeIcon: <IoInformationCircle className="size-full" />,
    },
  ],
  themes: [
    {
      name: "light",
      icon: <IoIosSunny className="size-full" />,
    },
    {
      name: "dark",
      icon: <IoMoon className="size-full" />,
    },
    {
      name: "system",
      icon: <HiComputerDesktop className="size-full" />,
    },
  ],
  queryLists: {
    movies: [
      {
        name: "Today's Trending Movies",
        query: () => tmdb.trending.trending("movie", "day"),
        param: "todayTrending",
      },
      {
        name: "Top Rated Movies",
        query: () => tmdb.movies.topRated(),
        param: "topRated",
      },
      {
        name: "This Week's Trending Movies",
        query: () => tmdb.trending.trending("movie", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Popular Movies",
        query: () => tmdb.movies.popular(),
        param: "popular",
      },
      {
        name: "Now Playing Movies",
        query: () => tmdb.movies.nowPlaying(),
        param: "nowPlaying",
      },
      {
        name: "Upcoming Movies",
        query: () => tmdb.movies.upcoming(),
        param: "upcoming",
      },
      
    ],
    tvShows: [
      {
        name: "Today's Trending TV Shows",
        query: () => tmdb.trending.trending("tv", "day"),
        param: "todayTrending",
      },
      {
        name: "Top Rated TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'TopRatedTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.topRated(),
        param: "topRated",
      },
      {
        name: "Asian Dramas",
        // A mixed Korean, Chinese, and Japanese TV drama row. Discover accepts
        // pipe-delimited values as an OR filter for these fields.
        query: () =>
          tmdb.discover.tvShow({
            sort_by: "popularity.desc",
            with_genres: "18",
            with_original_language: "ko|zh|ja",
            with_origin_country: "KR|CN|JP",
          } as Parameters<typeof tmdb.discover.tvShow>[0] & { with_origin_country: string }),
        param: "asianDramas",
      },
      {
        name: "On The Air TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult' but required in type 'TV'.
        query: () => tmdb.tvShows.onTheAir(),
        param: "onTheAir",
      },
      {
        name: "Popular TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.popular(),
        param: "popular",
      },
      {
        name: "This Week's Trending TV Shows",
        query: () => tmdb.trending.trending("tv", "week"),
        param: "thisWeekTrending",
      },      
    ],
  },
  socials: {
    github: "https://github.com/sashendev/SASHFLIX",
  },
};

export type SiteConfig = typeof siteConfig;
