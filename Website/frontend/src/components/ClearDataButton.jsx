import { useState } from "react";
import { clearHdfsData } from "../services/api";
import "./ClearDataButton.css";

function ClearDataButton({ onCleared }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleClear = async () => {
    const ok = window.confirm(
      "Supprimer tous les fichiers HDFS (Bronze documents, Silver, Gold) ?\n\nCette action est irréversible."
    );
    if (!ok) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await clearHdfsData();
      const { data } = res;
      setMessage(data.message || "Terminé.");
      if (typeof onCleared === "function") {
        onCleared(data);
      } else if (data.success) {
        window.setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          err.message ||
          "Erreur lors du vidage HDFS."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clear-data-wrap">
      <button
        type="button"
        className="btn-clear-hdfs"
        disabled={loading}
        onClick={handleClear}
        title="Supprime les fichiers dans bronze/documents, silver/ocr_text et gold"
      >
        {loading ? "Vidage…" : "Clear data (HDFS)"}
      </button>
      {message && (
        <p className={`clear-data-msg ${message.includes("Erreur") ? "err" : ""}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default ClearDataButton;
