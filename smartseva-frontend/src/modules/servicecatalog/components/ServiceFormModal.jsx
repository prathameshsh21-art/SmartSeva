import React from 'react';
import ModalShell from '../../../components/ui/ModalShell';

export default function ServiceFormModal({
  modalId = 'serviceFormModal',
  onSubmit,
}) {
  return (
    <ModalShell
      id={modalId}
      title="Create Service Request"
      submitText="Save Service"
      onSubmit={onSubmit}
    >
      <form>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Service Name
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter service name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Category
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter category"
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Description
          </label>

          <textarea
            className="form-control"
            rows="3"
          ></textarea>
        </div>

      </form>
    </ModalShell>
  );
}