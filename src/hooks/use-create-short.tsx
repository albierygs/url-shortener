import { shortenFullUrl } from "@/services/url-service";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

const useCreateShort = () => {
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [fullLink, setFullLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApi = async (fullLink: string) => {
      try {
        setLoading(true);
        const data = await shortenFullUrl(fullLink);
        setShortLink(data.shortLink);
      } catch (error) {
        console.log(error);
        if (error instanceof AxiosError) {
          setError(error.response?.data.message || "Erro ao criar short link.");
        } else {
          setError("Erro ao criar short link.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (fullLink) {
      fetchApi(fullLink);
    }
  }, [fullLink]);

  return { setFullLink, setShortLink, setError, shortLink, loading, error };
};

export default useCreateShort;
