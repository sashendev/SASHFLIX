"use client";

import { User } from "@heroui/react";
import { Person } from "tmdb-ts";
import Link from "next/link";
import { getImageUrl } from "@/utils/movies";

interface PersonCardProps {
  person: Person;
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => (
  <Link
    href={`/person/${person.id}`}
    className="bg-secondary-background hover:border-primary flex min-w-0 items-center gap-3 rounded-xl border border-transparent p-4 transition-colors"
  >
    <User
      name={person.name}
      description={person.known_for_department || "Actor"}
      avatarProps={{
        src: getImageUrl(person.profile_path, "avatar"),
        size: "lg",
        showFallback: true,
        isBordered: true,
      }}
      classNames={{ wrapper: "min-w-0", name: "truncate", description: "truncate" }}
    />
  </Link>
);

export default PersonCard;
