// test 2 fichier 
import { useState } from "react";
import { uploadCase } from "../services/api";

function UploadCase() {
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [attestationFile, setAttestationFile] = useState(null);

  const handleInvoiceChange = (e) => setInvoiceFile(e.target.files[0]);
  const handleAttestationChange = (e) => setAttestationFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!invoiceFile || !attestationFile) {
      alert("Veuillez sélectionner les deux fichiers !");
      return;
    }

    const formData = new FormData();
    formData.append("invoice", invoiceFile);
    formData.append("attestation", attestationFile);

    try {
      const response = await uploadCase(formData);
      console.log("Réponse backend :", response.data);
      alert("Case upload réussi !");
      setInvoiceFile(null);
      setAttestationFile(null);
      // Réinitialiser les inputs visuellement
      document.getElementById("invoiceInput").value = "";
      document.getElementById("attestationInput").value = "";
    } catch (error) {
      console.error("Erreur upload :", error);
      alert("Erreur lors de l'upload du case");
    }
  };

  return (
    <div className="upload-container">
      <h2>Uploader un Case</h2>

      <label>
        Facture:
        <input
          id="invoiceInput"
          type="file"
          onChange={handleInvoiceChange}
        />
      </label>

      <label>
        Attestation:
        <input
          id="attestationInput"
          type="file"
          onChange={handleAttestationChange}
        />
      </label>

      <button onClick={handleUpload}>Envoyer le Case</button>
    </div>
  );
}

export default UploadCase;