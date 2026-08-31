import React, { useEffect, useState } from 'react';
import DocumentTable from '../components/DocumentTable';
import FileUploadModal from '../components/FileUploadModal';
import Pagination from '../../../components/common/Pagination';
import { documentService } from '../../../api/services/documentService';
import { serviceCatalogService } from '../../../api/services/serviceCatalogService';
import { useToast } from '../../../context/ToastContext';

export default function DocumentVault() {
  const { showSuccess, showError } = useToast();
  const [documents, setDocuments] = useState([]);
  const [services, setServices] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadDocuments = async (pageNumber = page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await documentService.getAll(pageNumber, 10);
      const pageData = response?.data;
      if (pageData && Array.isArray(pageData.content)) {
        setDocuments(pageData.content);
        setTotalPages(pageData.totalPages || 1);
      } else if (Array.isArray(pageData)) {
        setDocuments(pageData);
        setTotalPages(1);
      } else {
        setDocuments([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await serviceCatalogService.getAll(0, 100);
      const data = response?.data?.content || response?.data || [];
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err) {
      console.warn('Could not pre-load services for vault:', err);
    }
  };

  useEffect(() => {
    loadDocuments(page);
    loadServices();
  }, [page]);

  const handleDownload = async (doc) => {
    try {
      const blob = await documentService.download(doc.documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalFileName || `document-${doc.documentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Error:', err);
      showError('Failed to download document.');
    }
  };

  const handleDelete = async (doc) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.originalFileName}"?`
    );
    if (!confirmed) return;

    try {
      await documentService.delete(doc.documentId);
      showSuccess('Document deleted successfully.');
      await loadDocuments(page);
    } catch (err) {
      console.error('Delete Error:', err);
      showError('Failed to delete document.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Document Vault</h3>
        <button
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          + Upload Document
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading documents...</span>
          </div>
        </div>
      ) : (
        <DocumentTable
          documents={documents}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <FileUploadModal
        show={showUploadModal}
        services={services}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={() => {
          showSuccess('Document uploaded successfully!');
          loadDocuments(page);
        }}
      />
    </div>
  );
}