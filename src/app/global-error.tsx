'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          alignItems: 'center',
          background: '#0a0b0d',
          color: '#e8eaed',
          display: 'grid',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          minHeight: '100vh',
          margin: 0,
          padding: 24,
        }}
      >
        <title>Divisas App - Error</title>
        <main
          style={{
            background: '#101215',
            border: '1px solid #22262d',
            borderRadius: 10,
            margin: '0 auto',
            maxWidth: 440,
            padding: 28,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Image
            alt="Divisas App"
            height={58}
            src="/logo.png"
            style={{
              height: 58,
              marginBottom: 18,
              objectFit: 'contain',
              width: 58,
            }}
            width={58}
          />
          <h1 style={{ fontSize: 26, lineHeight: 1.1, margin: '0 0 10px' }}>
            No se pudo cargar la app
          </h1>
          <p style={{ color: '#9aa0a6', fontSize: 14, margin: '0 0 20px' }}>
            Intenta de nuevo. Si el problema sigue, revisa los registros del
            servidor.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              background: '#d4a574',
              border: 0,
              borderRadius: 7,
              color: '#0a0b0d',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '11px 16px',
            }}
            type="button"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
