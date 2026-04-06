import React from 'react';
import { Link } from 'react-router-dom';

const AuthHeader = () => {
  return (
    <header style={{
      background: 'var(--header-bg)',
      padding: '0.75rem 0',
      boxShadow: 'var(--shadow-xs)',
      borderBottom: '1px solid var(--header-border)',
    }}>
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Link
          to="/"
          style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            fontStyle: 'italic',
            color: 'var(--text-heading)',
            textDecoration: 'none',
            letterSpacing: '-0.3px'
          }}
        >
          DigiHub
        </Link>
      </div>
    </header>
  );
};

export default AuthHeader;
