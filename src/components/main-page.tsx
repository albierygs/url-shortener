import type { ReactNode } from "react";

interface MainPageProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}

const MainPage = ({ children, header, footer }: MainPageProps) => (
  <div className="min-h-screen flex flex-col bg-background">
    {header}
    <main className="flex-1 flex items-center pt-16 pb-12">
      <div className="max-w-6xl w-full mx-auto px-6">{children}</div>
    </main>
    {footer}
  </div>
);

export default MainPage;
