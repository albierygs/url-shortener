import api from "@/lib/axios";
import type { CreateShortResponseData, FindFullLinkResponseData } from "../types/response-types";

export const getFullUrlByShort = async (shortId: string) => {
  const result = await api.get<FindFullLinkResponseData>("/find", { params: { shortId } });

  return result.data;
};

export const shortenFullUrl = async (url: string) => {
  const result = await api.post<CreateShortResponseData>("/shorten", {
    url
  });

  return result.data;
};
