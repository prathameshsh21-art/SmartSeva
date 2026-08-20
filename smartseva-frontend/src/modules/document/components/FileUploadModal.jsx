import React, { useState } from 'react';
import ModalShell from '../../../components/ui/ModalShell';

export default function FileUploadModal({
  modalId = 'fileUploadModal',
  onSubmit,
}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = () => {
    if (!selectedFile) {
      alert('Please select a file.');
      return;
    }

    onSubmit(selectedFile);
  };

  return (
    <ModalShell
      id={modalId}
      title="Upload Document"
      onSubmit={handleSubmit}
      submitText="Upload File"
    >
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Select File
        </label>

        <input
          type="file"
          className="form-control"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
      </div>
    </ModalShell>
  );
}