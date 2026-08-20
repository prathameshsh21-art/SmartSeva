import React from 'react';

export default function Pagination({
  page = 0,
  totalPages = 1,
  onPageChange,
}) {
  return (
    <nav className="mt-3">
      <ul className="pagination justify-content-end">

        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, index) => (
          <li
            key={index}
            className={`page-item ${page === index ? 'active' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(index)}
            >
              {index + 1}
            </button>
          </li>
        ))}

        <li
          className={`page-item ${
            page >= totalPages - 1 ? 'disabled' : ''
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </li>

      </ul>
    </nav>
  );
}