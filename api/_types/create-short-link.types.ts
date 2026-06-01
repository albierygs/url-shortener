import z from "zod";
import { createShortLinkSchema } from "../_schemas/create-short-link.schema";

export type CreateShortLinkRequest = z.infer<typeof createShortLinkSchema.shape.request>;
export type CreateShortLinkResponse = z.infer<typeof createShortLinkSchema.shape.response>;
