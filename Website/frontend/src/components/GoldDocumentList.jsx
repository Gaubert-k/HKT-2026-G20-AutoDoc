import { useEffect, useState } from "react";
import { getGoldDocuments } from "../services/api";

function GoldDocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoldDocuments = async () => {
      try {
        const res = await getGoldDocuments();

        if (res.data.success && res.data.data.length > 0) {
          const docs = [];

          res.data.data.forEach((file) => {
            if (!Array.isArray(file.content)) return;

            file.content.forEach((doc) => {
              docs.push({
                filename: doc.nom_fichier || file.file_name,
                siret: doc.extracted_data?.siret || "N/A",
                tva: doc.extracted_data?.tva || "N/A",
                montant: doc.extracted_data?.amount_ht || "N/A",
                date: doc.extracted_data?.date || "N/A",
                anomalies: doc.anomalies || [],
                fiabilite_score: doc.fiabilite_score ?? null
              });
            });
          });

          setDocuments(docs);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error("Erreur fetch Gold documents :", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoldDocuments();
  }, []);

  if (loading) return <p>Chargement des documents (Gold)...</p>;
  if (documents.length === 0)
    return <p>Aucun document Gold pour le moment.</p>;

  return (
    <div className="documents-container">
      <h2>📌 Documents analysés (Gold)</h2>
      <div className="documents-grid">
        {documents.map((doc, idx) => (
          <div key={idx} className="document-card">
            <h3>{doc.filename}</h3>
            <div className="doc-info">
              <p>
                <strong>Fiabilité :</strong>{" "}
                {doc.fiabilite_score != null ? `${doc.fiabilite_score} %` : "N/A"}
              </p>
              <p>
                <strong>SIRET :</strong> {doc.siret}
              </p>
              <p>
                <strong>TVA :</strong> {doc.tva}
              </p>
              <p>
                <strong>Montant HT :</strong> {doc.montant} €
              </p>
              <p>
                <strong>Date :</strong> {doc.date}
              </p>
            </div>
            {doc.anomalies.length > 0 && (
              <div className="warning">
                ⚠ Anomalies : {doc.anomalies.join(", ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoldDocumentList;

