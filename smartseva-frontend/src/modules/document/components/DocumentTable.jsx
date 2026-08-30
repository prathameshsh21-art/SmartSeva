import React from 'react';
import DataTable from '../../../components/ui/DataTable';
import { formatDateTime } from '../../../utils/dateUtils';

export default function DocumentTable({
  documents = [],
  onDownload,
  onDelete,
}) {
  const columns = [
    { key: 'documentId', label: 'ID' },
    { key: 'originalFileName', label: 'Document Name' },
    { key: 'fileType', label: 'Type' },
    { key: 'uploadedByName', label: 'Uploaded By' },
    { key: 'uploadedAt', label: 'Uploaded At' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = documents.map((doc) => ({
    documentId: `#${doc.documentId}`,
    originalFileName: (
      <span className="fw-semibold text-primary">
        <i className="bi bi-file-earmark-text me-1"></i>
        {doc.originalFileName}
      </span>
    ),
    fileType: doc.fileType || 'Document',
    uploadedByName: doc.uploadedByName || 'Staff',
    uploadedAt: formatDateTime(doc.uploadedAt),

    actions: (
      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onDownload?.(doc)}
        >
          Download
        </button>

        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete?.(doc)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <DataTable
      columns={columns}
      data={tableData}
    />
  );
}