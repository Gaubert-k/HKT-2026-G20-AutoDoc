import { useState } from "react";
import { uploadDocuments } from "../services/api";

function UploadDocuments() {
  const [files, setFiles] = useState([]);
  const handleChange = (e) => {
    setFiles(e.target.files);
  };
  const handleUpload = async () => {
    const formData = new FormData();
    for (let file of files) {
      formData.append("documents", file);
    }
    try {
      await uploadDocuments(formData);
      alert("Upload réussi");
    } catch (error) {
      console.error(error);
      alert("Erreur upload");
    }
  };
  return (

    <div>
      <h2>Déposez vos documents</h2>
      <input
        type="file"
        multiple
        onChange={handleChange}
      />
      <button onClick={handleUpload}>
        Envoyer
      </button>
    </div>
  );
}

export default UploadDocuments;