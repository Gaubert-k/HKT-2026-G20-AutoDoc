import { useState, useEffect } from "react";
import UploadDocuments from "./components/UploadDocuments";
import DocumentList from "./components/DocumentList";
import GoldDocumentList from "./components/GoldDocumentList";
import ClearDataButton from "./components/ClearDataButton";
import { FaSun, FaMoon } from "react-icons/fa6"; // si dossier fa6
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Plateforme d'analyse de documents</h1>
        <p className="subtitle">
          Téléversez vos fichiers et obtenez l'analyse automatiquement
        </p>

        {/* Toggle Switch avec icônes */}
        <div className="toggleSwitch" onClick={() => setDarkMode(!darkMode)}>
          <div className={`switch ${darkMode ? "dark" : "light"}`}>
            <FaSun className="icon sun" />
            <FaMoon className="icon moon" />
          </div>
        </div>

        <ClearDataButton />
      </header>

      <main className="main-content">
        <UploadDocuments />
        <DocumentList />
        <GoldDocumentList />
      </main>
    </div>
  );
}

export default App;