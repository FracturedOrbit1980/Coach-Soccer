import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { BoardPage } from "./pages/Board";
import { ClientProfilePage } from "./pages/ClientProfile";
import { ClientsPage } from "./pages/Clients";
import { Landing } from "./pages/Landing";
import { SheetPage } from "./pages/Sheet";
import { EditorProvider, useEditor } from "./store/editor";

function Title() {
  const location = useLocation();
  const { session } = useEditor();
  useEffect(() => {
    document.title =
      location.pathname === "/"
        ? "Scottish FA UEFA Licence Tactical Platform"
        : `${session.title} · SFA Tactics`;
  }, [location.pathname, session.title]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <EditorProvider>
        <Title />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/sheet" element={<SheetPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:clientId" element={<ClientProfilePage />} />
        </Routes>
      </EditorProvider>
    </HashRouter>
  );
}
