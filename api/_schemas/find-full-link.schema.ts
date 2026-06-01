import z from "zod";

export const findFullLinkSchema = z.object({
  query: z.object({
    shortId: z.string().nonoptional()
  }),

  response: z
    .object({
      fullLink: z.url()
    })
    .or(
      z.object({
        error: z.string()
      })
    )
});
