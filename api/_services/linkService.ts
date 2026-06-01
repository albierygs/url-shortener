import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";
import { accessLogTable, linkTable } from "../_db/schema.js";
import { AppException } from "../_exceptions/AppException.js";
import db from "../_lib/drizzle.js";
import { redisClient } from "../_lib/redis.js";

export const findLinkByShortId = async (
  shortId: string
): Promise<{
  id: number;
  fullLink: string;
  shortId: string;
  createdAt: Date;
  updatedAt: Date;
}> => {
  const redisLinkKey = `link:${shortId}`;
  const linkInCache = await redisClient.exists(redisLinkKey);

  if (linkInCache) {
    const fullLink = await redisClient.get(redisLinkKey);
    console.info(`Link found in cache for shortId ${shortId}`);
    return JSON.parse(fullLink!);
  }

  const link = await db.query.linkTable.findFirst({ where: eq(linkTable.shortId, shortId) });

  if (!link) {
    throw new AppException("Link not found", 404);
  }

  console.info(`Link found in database for shortId ${shortId}`);
  await redisClient.mSetEx(
    {
      [redisLinkKey]: JSON.stringify(link),
      [`fullLink:${link.fullLink}`]: JSON.stringify(link)
    },
    { expiration: { type: "EX", value: 60 * 60 * 24 * 7 } }
  );

  return link;
};

export const getShortIdIfLinkExists = async (fullLink: string): Promise<string | null> => {
  const redisLinkKey = `fullLink:${fullLink}`;
  const linkInCache = await redisClient.exists(redisLinkKey);

  if (linkInCache) {
    const fullLinkString = await redisClient.get(redisLinkKey);
    console.info(`Link found in cache for fullLink ${fullLink}`);

    const fullLinkData: {
      id: number;
      fullLink: string;
      shortId: string;
      createdAt: Date;
      updatedAt: Date;
    } = JSON.parse(fullLinkString!);
    return fullLinkData.shortId;
  }

  const link = await db.query.linkTable.findFirst({ where: eq(linkTable.fullLink, fullLink) });

  if (link) {
    console.info(`Link found in database for fullLink ${fullLink}`);
    await redisClient.mSetEx(
      {
        [redisLinkKey]: JSON.stringify(link),
        [`link:${link.shortId}`]: JSON.stringify(link)
      },
      { expiration: { type: "EX", value: 60 * 60 * 24 * 7 } }
    );
  }

  return link ? link.shortId : null;
};

export const getSummaryLinkFromPeriod = async (
  shortId: string,
  period: "24h" | "7d" | "30d" | "90d" | "all"
): Promise<{ totalAccesses: number; peakAccesses: number; average: number }> => {
  const datePeriod = transformPeriodToDate(period);

  const accesses = await db
    .select({ accessedAt: accessLogTable.accessedAt })
    .from(accessLogTable)
    .where(
      and(gte(accessLogTable.accessedAt, datePeriod), eq(accessLogTable.linkShortId, shortId))
    );

  if (accesses.length === 0) {
    return {
      totalAccesses: 0,
      peakAccesses: 0,
      average: 0
    };
  }

  // Total de acessos no período
  const totalAccesses = accesses.length;

  // Pico de acessos no período
  const peakAccesses = await getAccessesGrouoedByPeriod(shortId, period);
  const maxPeakAccess = Math.max(...peakAccesses.map((access) => access.count));

  // Média de acessos no período
  let totalTimeUnits = Number();
  if (period === "all") {
    const firstAcess = new Date(Math.min(...accesses.map((item) => item.accessedAt.getTime())));
    totalTimeUnits =
      (new Date().getFullYear() - firstAcess.getFullYear()) * 12 +
      (new Date().getMonth() - firstAcess.getMonth()) +
      1;
  }
  totalTimeUnits = period === "all" ? totalTimeUnits : parseInt(period);
  const average = totalAccesses / totalTimeUnits;

  return {
    totalAccesses,
    peakAccesses: maxPeakAccess,
    average
  };
};

export const getAccessesGrouoedByPeriod = async (
  shortId: string,
  period: "24h" | "7d" | "30d" | "90d" | "all"
): Promise<
  {
    data: string;
    count: number;
  }[]
> => {
  const datePeriod = transformPeriodToDate(period);

  const truncUnit =
    period === "24h" ? sql.raw("'hour'") : period === "all" ? sql.raw("'month'") : sql.raw("'day'");
  const periodExp = sql<string>`DATE_TRUNC(${truncUnit}, ${accessLogTable.accessedAt})`;

  const accesses = await db
    .select({
      data: periodExp,
      count: count()
    })
    .from(accessLogTable)
    .where(and(gte(accessLogTable.accessedAt, datePeriod), eq(accessLogTable.linkShortId, shortId)))
    .groupBy(periodExp)
    .orderBy(asc(periodExp));
  return accesses;
};

export const getDevicesTypesByPeriod = async (
  shortId: string,
  period: "24h" | "7d" | "30d" | "90d" | "all"
): Promise<
  {
    name: "desktop" | "mobile" | "tablet" | "bot";
    value: number;
  }[]
> => {
  const datePeriod = transformPeriodToDate(period);

  const devices = await db
    .select({
      name: accessLogTable.device_type,
      value: count()
    })
    .from(accessLogTable)
    .where(and(gte(accessLogTable.accessedAt, datePeriod), eq(accessLogTable.linkShortId, shortId)))
    .groupBy(accessLogTable.device_type);
  return devices;
};

export const getAccessesTodayGroupedByHour = async (
  shortId: string
): Promise<
  {
    hour: string;
    count: number;
  }[]
> => {
  const today = new Date();
  const startDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

  const hourExpr = sql<string>`
    EXTRACT(HOUR FROM ${accessLogTable.accessedAt})
  `;
  const accessesToday = await db
    .select({
      hour: hourExpr,.js
      count: count().mapWith(Number)
    })
    .from(accessLogTable)
    .where(and(gte(accessLogTable.accessedAt, startDay), eq(accessLogTable.linkShortId, shortId)))
    .groupBy(hourExpr)
    .orderBy(desc(hourExpr));

  const accessMap = new Map(accessesToday.map((item) => [Number(item.hour), Number(item.count)]));

  const accessesTodayData = Array.from({ length: 24 }, (_, hour) => ({
    hour: String(hour),
    count: accessMap.get(hour) ?? 0
  }));
  return accessesTodayData;
};

export const getRecentsLogs = async (
  shortId: string,
  page: number,
  pageSize: number
): Promise<{
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  logs: {
    id: number;
    date: string;
    ip: string;
    userAgent: string;
    device: "desktop" | "mobile" | "tablet" | "bot";
  }[];
}> => {
  const total = await db
    .select({ count: count() })
    .from(accessLogTable)
    .where(eq(accessLogTable.linkShortId, shortId));

  const paginationConfig = {
    page: total[0].count / pageSize >= page ? page : Math.ceil(total[0].count / pageSize),
    pageSize,
    total: total[0].count,
    totalPages: total[0].count > 0 ? Math.ceil(total[0].count / pageSize) : 1
  };

  const offset = (paginationConfig.page - 1) * pageSize;

  const logs = await db
    .select({
      id: accessLogTable.id,
      date: accessLogTable.accessedAt,
      ip: accessLogTable.ipAddress,
      userAgent: accessLogTable.userAgent,
      device: accessLogTable.device_type
    })
    .from(accessLogTable)
    .where(eq(accessLogTable.linkShortId, shortId))
    .offset(offset)
    .limit(pageSize)
    .orderBy(desc(accessLogTable.accessedAt));

  const formatedLogs = logs.map((log) => {
    const dateIso = log.date.toISOString();
    const ipMasked = log.ip.split(".").slice(0, 2).join(".") + ".x.x";
    return {
      id: log.id,
      date: dateIso,
      ip: ipMasked,
      userAgent: log.userAgent,
      device: log.device
    };
  });

  return {
    pagination: paginationConfig,
    logs: formatedLogs
  };
};

const transformPeriodToDate = (period: "24h" | "7d" | "30d" | "90d" | "all"): Date => {
  const now = new Date();

  switch (period) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "all":
      return new Date(0);
  }
};
