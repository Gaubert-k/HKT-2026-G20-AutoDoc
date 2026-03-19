import { useEffect, useState } from "react";
import { getDocuments } from "../services/api";

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    const fetchDocuments = async () => {
      const res = await getDocuments();
      setDocuments(res.data);
    };
    fetchDocuments();
  }, []);
  return (
    <div>
      <h2>Documents analysés</h2>
      {documents.map((doc) => (
        <div key={doc._id}>
          <h3>{doc.filename}</h3>
          <p>SIRET : {doc.siret}</p>
          <p>TVA : {doc.tva}</p>
          <p>Montant : {doc.montant}</p>
          <p>Date : {doc.date}</p>
          {doc.warning && (
            <p style={{color:"red"}}>
              ⚠ {doc.warning}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default DocumentList;