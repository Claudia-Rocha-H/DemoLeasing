import { Home } from "./pages/Home";
import { OperationalTeamPage } from "./pages/operations/OperationalTeamPage";

export function App() {
  if (window.location.pathname.toLowerCase() === "/equipooperativo") {
    return <OperationalTeamPage />;
  }

  return <Home />;
}
