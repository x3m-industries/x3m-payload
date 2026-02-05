import React from 'react';

import './styles.css';

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="header">
          <div className="container header-nav">
            <a href="/" className="logo">
              Payload Demo
            </a>
            <nav className="nav-links">
              <a href="/">Home</a>
              <a href="/admin">Admin Dashboard</a>
            </nav>
          </div>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <footer
          style={{
            borderTop: '1px solid rgba(255,255,255,0.3)',
            padding: '2rem 0',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            background: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="container">
            Type-safe services powered by <strong>Plugin Mode</strong>
          </div>
        </footer>
      </body>
    </html>
  );
}
