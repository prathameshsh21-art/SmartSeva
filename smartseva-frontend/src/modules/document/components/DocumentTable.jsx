import React from 'react';
import DataTable from '../../../components/ui/DataTable';

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
    documentId: doc.documentId,
    originalFileName: doc.originalFileName,
    fileType: doc.fileType,
    uploadedByName: doc.uploadedByName,
    uploadedAt: doc.uploadedAt,

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