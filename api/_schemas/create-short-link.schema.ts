import z from "zod";

export const createShortLinkSchema = z.object({
  request: z.object({
    url: z.url().nonoptional()
  }),

  response: z
    .object({
      shortLink: z.url()
    })
    .or(
      z.object({
        error: z.string()
      })
    )
});
