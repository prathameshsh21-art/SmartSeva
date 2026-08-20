import React from 'react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
}) {
  return (
    <div className="mb-3">

      <label className="form-label fw-semibold">
        {label}
      </label>

      <input
        type={type}
        className="form-control"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />

    </div>
  );
}