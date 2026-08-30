import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 2rem', gap: '1rem'
    }}>
      <div className="loading-spinner" />
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: '1rem',
      background: 'var(--cream)'
    }}>
      <div style={{
        width: 56, height: 56,
        background: 'linear-gradient(135deg, var(--orange), var(--orange-deep))',
        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Loader2 size={28} color="#fff" className="spin" />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--slate)' }}>
        Loading FreshKeeper...
      </p>
    </div>
  );
}
