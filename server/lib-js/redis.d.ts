import { Redis } from "@upstash/redis";

export const PROJECTS_KEY: string;
export const RESUME_KEY: string;
export const DEFAULT_RESUME_URL: string;

export function getRedis(): Redis | null;
