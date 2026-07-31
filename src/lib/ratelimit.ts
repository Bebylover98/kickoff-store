import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const registerRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'ratelimit:register',
});

export const loginRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, '10 m'),
  prefix: 'ratelimit:login',
});
