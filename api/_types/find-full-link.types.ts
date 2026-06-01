import z from "zod";
import { findFullLinkSchema } from "../_schemas/find-full-link.schema.js";

export type FindFullLinkQuery = z.infer<typeof findFullLinkSchema.shape.query>;
export type FindFullLinkResponse = z.infer<typeof findFullLinkSchema.shape.response>;
