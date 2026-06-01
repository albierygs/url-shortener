import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import Redirect from "./pages/redirect";
import Analytics from "./pages/analytics";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:id/analytics" element={<Analytics />} />
      <Route path="/:id" element={<Redirect />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route
        path="*"
        element={
          <Navigate
            to="/not-found"
            replace
            state={{
              from: location.pathname
            }}
          />
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
