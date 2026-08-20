import React from 'react';

export default function ToastMessage({
  type = 'success',
  message,
}) {
  const bg =
    type === 'success'
      ? 'alert-success'
      : type === 'error'
      ? 'alert-danger'
      : type === 'warning'
      ? 'alert-warning'
      : 'alert-info';

  if (!message) return null;

  return (
    <div className={`alert ${bg}`} role="alert">
      {message}
    </div>
  );
}