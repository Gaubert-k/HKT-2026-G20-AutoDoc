import { useEffect, useState } from "react";
import { getSilverDocuments } from "../services/api";

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSilverDocuments = async () => {
      try {
        const res = await getSilverDocuments();

        if (res.data.success && res.data.data.length > 0) {
          let docs = [];
          res.data.data.forEach((file) => {
            const rows = Array.isArray(file.content) ? file.content : [];
            rows.forEach((doc) => {
              docs.push({
                filename: doc.nom_fichier,
                siret: doc.extracted_data?.siret || "N/A",
                tva: doc.extracted_data?.tva || "N/A",
                montant: doc.extracted_data?.amount_ht || "N/A",
                date: doc.extracted_data?.date || "N/A",
                anomalies: doc.anomalies || []
              });
            });
          });
          setDocuments(docs);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error("Erreur fetch Silver documents :", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSilverDocuments();
  }, []);

  if (loading) return <p>Chargement des documents...</p>;
  if (documents.length === 0) return <p>Aucun document Silver pour le moment.</p>;

  return (
    <div className="documents-container">
      <h2>📑 Documents analysés (Silver)</h2>
      <div className="documents-grid">
        {documents.map((doc, idx) => (
          <div key={idx} className="document-card">
            <h3>{doc.filename}</h3>
            <div className="doc-info">
              <p><strong>SIRET :</strong> {doc.siret}</p>
              <p><strong>TVA :</strong> {doc.tva}</p>
              <p><strong>Montant HT :</strong> {doc.montant} €</p>
              <p><strong>Date :</strong> {doc.date}</p>
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

export default DocumentList;