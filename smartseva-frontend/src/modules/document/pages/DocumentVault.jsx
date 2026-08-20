import React, { useEffect, useState } from 'react';
import DocumentTable from '../components/DocumentTable';
import FileUploadModal from '../components/FileUploadModal';
import { documentService } from '../../../api/services/documentService';

export default function DocumentVault() {
  const [documents, setDocuments] = useState([]);

  const serviceId = 1;

  const loadDocuments = async () => {
    try {
      const response = await documentService.getByServiceId(serviceId);

      console.log("Documents Response:", response);

      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();

      formData.append("serviceId", serviceId);
      formData.append("file", file);

      await documentService.upload(formData);

      alert("Document uploaded successfully.");

      await loadDocuments();
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload document.");
    }
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await documentService.download(doc.documentId);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = doc.originalFileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download Error:", error);
      alert("Failed to download document.");
    }
  };

  const handleDelete = async (doc) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.originalFileName}"?`
    );

    if (!confirmed) return;

    try {
      await documentService.delete(doc.documentId);

      alert("Document deleted successfully.");

      await loadDocuments();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Document Vault</h3>

        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#fileUploadModal"
        >
          Upload Document
        </button>
      </div>

      <DocumentTable
        documents={documents}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      <FileUploadModal
        modalId="fileUploadModal"
        onSubmit={handleUpload}
      />

    </div>
  );
}