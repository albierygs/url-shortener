import { Check, Copy, Link2 } from "lucide-react";
import { useState } from "react";

const ShortLinkResult = ({ shortUrl }: { shortUrl: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link2 size={14} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{shortUrl}</span>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          aria-label="Copiar link"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};

export default ShortLinkResult;
