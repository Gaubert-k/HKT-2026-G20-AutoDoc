import UploadDocuments from "./components/UploadDocuments";
import DocumentList from "./components/DocumentList";

function App() {
  return (
    <div>
      <h1>Dépose de documents</h1>
      <UploadDocuments />
      <hr />
      <DocumentList />
    </div>
  );
}
export default App;