import { useEffect, useMemo, useState } from "react";
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
                document_type: doc.document_type || doc.type || "unknown",
                siret: doc.extracted_data?.siret || "N/A",
                tva: doc.extracted_data?.tva || "N/A",
                montant: doc.extracted_data?.amount_ht || "N/A",
                date: doc.extracted_data?.date || "N/A",
                date_expiration:
                  doc.extracted_data?.date_expiration ||
                  doc.extracted_data?.expiration_date ||
                  null,
                status: (doc.extracted_data?.status || "").toLowerCase(),
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

  const complianceSummary = useMemo(() => {
    const normalizeType = (type = "", filename = "") => {
      const raw = `${type} ${filename}`.toLowerCase();
      if (raw.includes("facture") || raw.includes("invoice")) return "invoice";
      if (raw.includes("attestation")) return "attestation";
      return "other";
    };

    const invoices = documents.filter(
      (d) => normalizeType(d.document_type, d.filename) === "invoice"
    );
    const attestations = documents.filter(
      (d) => normalizeType(d.document_type, d.filename) === "attestation"
    );

    const invoiceSirets = new Set(
      invoices.map((d) => d.siret).filter((s) => s && s !== "N/A")
    );
    const attestationSirets = new Set(
      attestations.map((d) => d.siret).filter((s) => s && s !== "N/A")
    );

    const sharedSiret = [...invoiceSirets].some((s) => attestationSirets.has(s));
    const hasSiretMismatch =
      invoiceSirets.size > 0 && attestationSirets.size > 0 && !sharedSiret;

    const today = new Date();
    const expiredAttestations = attestations.filter((d) => {
      if (d.status === "expired") return true;
      if (!d.date_expiration) return false;
      const parsed = new Date(d.date_expiration);
      return !Number.isNaN(parsed.getTime()) && parsed < today;
    });

    return {
      hasSiretMismatch,
      expiredAttestationsCount: expiredAttestations.length
    };
  }, [documents]);

  if (loading) return <p>Chargement des documents (Gold)...</p>;
  if (documents.length === 0)
    return <p>Aucun document Gold pour le moment.</p>;

  return (
    <div className="documents-container">
      <h2> Documents analysés (Gold)</h2>
      <div className="document-card" style={{ marginBottom: "1rem" }}>
        <h3>Contrôles conformité</h3>
        <p>
          <strong>SIRET facture vs attestation :</strong>{" "}
          {complianceSummary.hasSiretMismatch ? "ALERTE" : "OK"}
        </p>
        <p>
          <strong>Attestations expirées :</strong>{" "}
          {complianceSummary.expiredAttestationsCount}
        </p>
      </div>
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

