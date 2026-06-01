import { FastifyReply, FastifyRequest } from "fastify";
import { redisClient } from "../_lib/redis.js";
import {
  findLinkByShortId,
  getAccessesGrouoedByPeriod,
  getAccessesTodayGroupedByHour,
  getDevicesTypesByPeriod,
  getRecentsLogs,
  getSummaryLinkFromPeriod
} from "../_services/linkService.js";
import {
  AnalyticsLinkParams,
  AnalyticsLinkQuery,
  AnalyticsLinkResponse
} from "../_types/analyttics-link.types.js";

export const analyticsLinkController = async (
  req: FastifyRequest<{ Params: AnalyticsLinkParams; Querystring: AnalyticsLinkQuery }>,
  reply: FastifyReply<{ Reply: AnalyticsLinkResponse }>
) => {
  const { shortId } = req.params;
  const { period, page, pageSize } = req.query;

  const analyticsKey = `analytics:${shortId}:${period}:page${page}:pageSize${pageSize}`;
  const analyticsExists = await redisClient.exists(analyticsKey);

  if (analyticsExists) {
    const cachedAnalytics = await redisClient.get(analyticsKey);
    return reply.status(200).send(JSON.parse(cachedAnalytics!));
  }

  const link = await findLinkByShortId(shortId);

  const summary = await getSummaryLinkFromPeriod(shortId, period);

  const lineChartData = await getAccessesGrouoedByPeriod(shortId, period);

  const devicesData = await getDevicesTypesByPeriod(shortId, period);

  const hourlyAccessesToday = await getAccessesTodayGroupedByHour(shortId);

  const recentLogs = await getRecentsLogs(shortId, page, pageSize);

  const responseData: AnalyticsLinkResponse = {
    originalLink: link.fullLink,
    shortId: link.shortId,
    summary,
    lineChartData: lineChartData.map((item) => ({ time: item.data, accesses: item.count })),
    deviceTypeData: devicesData,
    hourlyAccessesToday: hourlyAccessesToday.map((item) => ({
      hour: item.hour,
      accesses: item.count
    })),
    recentLogs
  };

  await redisClient.set(analyticsKey, JSON.stringify(responseData));

  reply.status(200).send(responseData);
};
