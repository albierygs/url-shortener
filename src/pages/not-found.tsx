import Footer from "@/components/footer";
import Header from "@/components/header";
import MainPage from "@/components/main-page";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/config/enviroment";
import { ArrowLeft, Unlink } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const NotFound = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <MainPage header={<Header />} footer={<Footer />}>
      <div className="flex flex-col items-center text-center gap-6 py-16">
        {/* Ícone */}
        <div className="relative">
          <span className="text-[7rem] font-black tracking-tighter text-foreground/5 select-none leading-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Unlink size={24} className="text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-2 max-w-sm">
          <h1 className="text-xl font-semibold text-foreground">Link não encontrado</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {state?.from ? (
              <>
                O endereço{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">
                  {BASE_URL.concat(state.from)}
                </code>{" "}
                não existe ou pode ter expirado.
              </>
            ) : (
              "Este link não existe ou pode ter expirado."
            )}
          </p>
        </div>

        {/* Ação */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2 mt-2 hover:cursor-pointer"
        >
          <ArrowLeft size={14} />
          Voltar ao início
        </Button>
      </div>
    </MainPage>
  );
};

export default NotFound;
