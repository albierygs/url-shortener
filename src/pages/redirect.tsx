import MainPage from "@/components/main-page";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import useRedirect from "../hooks/use-redirect";

const Redirect = () => {
  const { data, loading, error } = useRedirect();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Redirecionando... | UrlShortener";
  });

  useEffect(() => {
    if (data?.fullLink) {
      window.location.href = data.fullLink;
    }

    if (error?.includes("not found")) {
      navigate("/not-found", { state: { from: window.location.pathname } });
    }
  }, [data, error, navigate]);

  return (
    <MainPage>
      {loading && (
        <div className="flex flex-col justify-center items-center">
          <Spinner />
          <div>Redirecting</div>
        </div>
      )}

      {error && !loading && (
        <div className="flex justify-center items-center w-full">
          <Alert className="bg-background w-sm" variant="destructive">
            <AlertTitle>Não foi possível redirecionar o link</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <AlertAction>
              <Button onClick={() => navigate("/")} className="hover:cursor-pointer">
                OK
              </Button>
            </AlertAction>
          </Alert>
        </div>
      )}
    </MainPage>
  );
};

export default Redirect;
