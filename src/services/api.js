import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

export const uploadDocuments = (data) => API.post("/upload", data);

export const getDocuments = () => API.get("/documents");