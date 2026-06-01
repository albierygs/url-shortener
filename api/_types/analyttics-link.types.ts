import z from "zod";
import { analyticsLinkSchema } from "../_schemas/analyttics-link.schema.js";

export type AnalyticsLinkParams = z.infer<typeof analyticsLinkSchema.shape.params>;
export type AnalyticsLinkQuery = z.infer<typeof analyticsLinkSchema.shape.query>;
export type AnalyticsLinkResponse = z.infer<typeof analyticsLinkSchema.shape.response>;
