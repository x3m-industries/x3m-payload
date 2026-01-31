import React from 'react';

import './styles.css';

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ borderBottom: '1px solid #ccc', padding: '1rem' }}>
          <nav>
            <a href="/" style={{ marginRight: '1rem' }}>
              Home
            </a>
            <a href="/admin">Admin</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer style={{ borderTop: '1px solid #ccc', marginTop: '2rem', padding: '1rem' }}>
          Rendered by Next.js App Router
        </footer>
      </body>
    </html>
  );
}
