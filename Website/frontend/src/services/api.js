import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${API_BASE}/api/documents`
});


export const uploadDocuments = (formData) => {
  return API.post("/upload", formData);
};


export const getDocuments = () => {
  return API.get("/");
};


export const getSilverDocuments = () => {
  return API.get("/silver");
};

export const getGoldDocuments = () => {
  return API.get("/gold");
};


export const uploadCase = (formData) => {
  return API.post("/process-case", formData);
};

/** Vide les dossiers HDFS bronze/silver/gold utilisés par l’appli. */
export const clearHdfsData = () => {
  return API.post("/clear-hdfs");
};