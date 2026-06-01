import Footer from "@/components/footer";
import Header from "@/components/header";
import MainPage from "@/components/main-page";
import UrlForm from "@/components/url-form";
import { Link2 } from "lucide-react";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    document.title = "Encurte seu Link | UrlShortener";
  });

  return (
    <MainPage header={<Header />} footer={<Footer />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Texto à esquerda */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <Link2 size={12} />
            Links mais curtos, compartilhamento mais simples
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
            Encurte qualquer
            <br />
            <span className="text-muted-foreground font-normal">link em segundos.</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            Cole qualquer URL longa e obtenha um link curto e fácil de compartilhar. Simples assim,
            sem cadastro.
          </p>
        </div>

        {/* Form à direita */}
        <div className="w-full max-w-md ml-auto">
          <UrlForm />
        </div>
      </div>
    </MainPage>
  );
};

export default Home;
