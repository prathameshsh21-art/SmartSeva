import React from 'react';
import ModalShell from '../../../components/ui/ModalShell';

export default function ServiceStatusModal({ modalId = 'serviceStatusModal', onSubmit }) {
  return (
    <ModalShell id={modalId} title="Update Service Status" onSubmit={onSubmit} submitText="Update Status">
      <form>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Lifecycle Status</label>
          <select className="form-select">
            <option value="NEW">NEW</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="PENDING">PENDING</option>
            <option value="WAITING_FOR_DOCUMENT">WAITING_FOR_DOCUMENT</option>
            <option value="SERVER_ISSUE">SERVER_ISSUE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Pending Reason</label>
          <select className="form-select">
            <option value="">None</option>
            <option value="MISSING_DOCUMENTS">MISSING_DOCUMENTS</option>
            <option value="SERVER_DOWN">SERVER_DOWN</option>
            <option value="INCORRECT_INFO">INCORRECT_INFO</option>
            <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
            <option value="PORTAL_ERROR">PORTAL_ERROR</option>
            <option value="DOCUMENT_VERIFICATION">DOCUMENT_VERIFICATION</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Remarks</label>
          <textarea className="form-control" rows="2" placeholder="Processing comments"></textarea>
        </div>
      </form>
    </ModalShell>
  );
}