import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, BarChart2, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useTheme } from "./theme-provider";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [showInput, setShowInput] = useState(false);
  const [analyticsUrl, setAnalyticsUrl] = useState("");
  const navigate = useNavigate();

  const handleGoToAnalytics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyticsUrl.trim()) return;

    let shortId = analyticsUrl.trim();
    try {
      if (shortId.startsWith("http")) {
        const urlObj = new URL(shortId);
        const paths = urlObj.pathname.split("/").filter(Boolean);
        if (paths.length > 0) {
          shortId = paths[0];
        }
      } else {
        const parts = shortId.split("/");
        shortId = parts[parts.length - 1];
      }
    } catch (e) {
      // Ignora e usa o valor original
    }

    setShowInput(false);
    navigate(`/${shortId}/analytics`);
  };

  return (
    <header className="w-full h-16 fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold tracking-tighter">S</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            url<span className="text-muted-foreground font-normal">shortner</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {showInput ? (
            <form
              onSubmit={handleGoToAnalytics}
              className="flex items-center gap-1 mr-1 sm:mr-2 animate-in fade-in slide-in-from-right-2 duration-300"
            >
              <Input
                type="text"
                placeholder="ID ou link curto"
                value={analyticsUrl}
                onChange={(e) => setAnalyticsUrl(e.target.value)}
                className="h-8 text-xs w-[120px] sm:w-[180px] bg-background"
                autoFocus
                onBlur={() => {
                  setTimeout(() => {
                    if (!analyticsUrl) setShowInput(false);
                  }, 150);
                }}
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 px-2 shrink-0"
                disabled={!analyticsUrl.trim()}
              >
                <ArrowRight size={14} />
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="h-9 px-2 sm:px-3 mr-0 sm:mr-1 rounded-md flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Acessar Analytics"
            >
              <BarChart2 size={16} />
              <span className="hidden sm:inline-block">Acessar analytics</span>
            </button>
          )}

          <div className="w-[1px] h-4 bg-border mx-1" />

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors hover:cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a
            href="https://github.com/albierygs/url-shortener"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="GitHub"
          >
            <FaGithub size={16} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
