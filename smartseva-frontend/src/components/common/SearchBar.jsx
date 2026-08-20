import React from 'react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}) {
  return (
    <div className="input-group mb-3">

      <span className="input-group-text">
        <i className="bi bi-search"></i>
      </span>

      <input
        type="text"
        className="form-control"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

    </div>
  );
}