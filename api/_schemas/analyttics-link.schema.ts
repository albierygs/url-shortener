import z from "zod";

export const analyticsLinkSchema = z.object({
  params: z.object({
    shortId: z
      .string("shortId deve ser uma string")
      .regex(/^[0-9A-Za-z]+$/, "shortId deve conter apenas caracteres alfanuméricos")
      .nonempty("shortId é obrigatório")
  }),

  query: z.object({
    period: z
      .enum(["24h", "7d", "30d", "90d", "all"], "period deve ser um dos valores válidos")
      .default("7d"),
    page: z.coerce
      .number("page deve ser um número")
      .int("page deve ser um número inteiro")
      .positive("page deve ser um número positivo")
      .default(1),
    pageSize: z.coerce
      .number("pageSize deve ser um número")
      .int("pageSize deve ser um número inteiro")
      .positive("pageSize deve ser um número positivo")
      .max(100, "pageSize deve ser no máximo 100")
      .default(10)
  }),

  response: z.object({
    originalLink: z.url(),
    shortId: z.string().regex(/^[0-9A-Za-z]+$/),

    summary: z.object({
      totalAccesses: z.number(),
      peakAccesses: z.number(),
      average: z.number()
    }),

    lineChartData: z.array(
      z.object({
        time: z.string(),
        accesses: z.number()
      })
    ),

    deviceTypeData: z.array(
      z.object({
        name: z.string(),
        value: z.number()
      })
    ),

    hourlyAccessesToday: z.array(
      z.object({
        hour: z.string(),
        accesses: z.number()
      })
    ),

    recentLogs: z.object({
      pagination: z.object({
        total: z.number(),
        page: z.number(),
        pageSize: z.number(),
        totalPages: z.number()
      }),
      logs: z.array(
        z.object({
          id: z.number(),
          date: z.string(),
          ip: z.string(),
          userAgent: z.string(),
          device: z.string()
        })
      )
    })
  })
});
