import createClient from "openapi-fetch";
import type { paths } from "@/types/chatterbox-api";
import { env } from "./env";

export const chatterbox = createClient<paths>({
  baseUrl: (process.env.CHATTERBOX_API_URL || env.CHATTERBOX_API_URL).replace(/\/+$/, ""),
  headers: {
    "x-api-key": process.env.CHATTERBOX_API_KEY || env.CHATTERBOX_API_KEY,
  },
});
