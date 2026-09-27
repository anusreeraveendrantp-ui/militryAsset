import React from 'react';
import Button from './Button';

export default function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'between',
      gap: '12px',
      padding: '12px 0',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '13px', color: '#6b7280', flex: 1 }}>
        Showing {start}–{end} of {total} results
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: page === p ? '#1e3a5f' : '#d1d5db',
                background: page === p ? '#1e3a5f' : 'white',
                color: page === p ? 'white' : '#374151',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          );
        })}
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
