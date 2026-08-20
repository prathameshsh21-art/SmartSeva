import React from 'react';
import ModalShell from './ModalShell';

export default function ConfirmDialog({
  modalId = 'confirmDialog',
  title = 'Confirmation',
  message = 'Are you sure?',
  onSubmit,
}) {
  return (
    <ModalShell
      id={modalId}
      title={title}
      submitText="Confirm"
      onSubmit={onSubmit}
    >
      <p className="mb-0">{message}</p>
    </ModalShell>
  );
}