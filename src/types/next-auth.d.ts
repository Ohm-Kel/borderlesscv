import type { ExperienceLevel } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      onboardedAt: string | null;
      experienceLevel: ExperienceLevel;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    onboardedAt?: string | null;
    experienceLevel?: ExperienceLevel;
  }
}
