import { getFullUrlByShort } from "@/services/url-service";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import type { FindFullLinkResponseData } from "../types/response-types";
import { isBase62 } from "../utils/validators";

const useRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<FindFullLinkResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchUrl = async (id: string) => {
      try {
        setLoading(true);
        const data = await getFullUrlByShort(id);
        setData(data);
      } catch (error) {
        console.log(error);
        if (error instanceof AxiosError) {
          setError(
            error.response?.data.message || error.response?.data.error || "Erro ao buscar link."
          );
        } else {
          setError("Erro ao buscar link.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!id || !isBase62(id)) {
      navigate(`/not-found`, { replace: true, state: { from: location.pathname } });
    } else {
      fetchUrl(id);
    }
  }, [id, navigate, location]);

  return { data, loading, error, id: id! };
};

export default useRedirect;
