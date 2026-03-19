import { useState, useRef } from "react";
import { uploadDocuments } from "../services/api";
import styles from "./UploadDocuments.module.css";

function UploadDocuments() {
  const [files, setFiles] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleDrop = (e) => {
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showPopupMessage("Veuillez sélectionner au moins une facture !");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      const response = await uploadDocuments(formData);
      console.log("Réponse backend :", response.data);
      showPopupMessage("Upload réussi !");
      setFiles([]);
    } catch (error) {
      console.error("Erreur upload :", error);
      showPopupMessage("Erreur lors de l'upload");
    }
  };

  const getFileIcon = (file) => {
    if (file.type.includes("pdf")) return "📄";
    if (file.type.includes("json") || file.name.toLowerCase().endsWith(".json")) return "🧾";
    if (file.type.includes("image")) return "🖼";
    return "📑";
  };

  return (
          <div className={styles.uploadContainer}>
        <div
          className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ""}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleDrop(e);
          }}
        >
          {/* Icône upload */}
          <div className={styles.cloudIcon}>
            <span role="img" aria-label="Upload">📤</span>
          </div>

          <p>Glissez vos fichiers PDF/JSON ici ou cliquez pour sélectionner</p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.json,application/pdf,application/json"
            onChange={handleChange}
            className={styles.fileInput}
          />
        </div>
      
      {files.length > 0 && (
        <div className={styles.filePreview}>
          {files.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              {getFileIcon(file)} {file.name}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeFile(index)}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={styles.uploadBtn} onClick={handleUpload}>
        Envoyer les fichiers
      </button>

      {showPopup && <div className={styles.popup}>{popupMessage}</div>}
    </div>
  );
}

export default UploadDocuments;