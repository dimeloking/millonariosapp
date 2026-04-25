import { Redis } from "@upstash/redis";
import { env } from "@/env";

const upstashUrl = env.UPSTASH_REDIS_REST_URL;
const upstashToken = env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  upstashUrl && upstashToken
    ? new Redis({
        url: upstashUrl,
        token: upstashToken,
      })
    : null;
