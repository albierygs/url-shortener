const Footer = () => {
  return (
    <footer className="w-full h-12 fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-full px-6 flex items-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <span className="text-foreground font-medium">
            <a
              href="https://albierygs.is-a.dev"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:underline"
            >
              Albiery Gonçalves
            </a>
          </span>{" "}
          — url shortner
        </p>
      </div>
    </footer>
  );
};

export default Footer;
