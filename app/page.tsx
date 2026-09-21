'use client';

import { useState } from 'react';

const DEFAULT_INPUT =
  "My Cohesity backup job failed for the third night in a row and I'm about to escalate this to the vendor.";

export default function Home() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || `Request failed with status ${res.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h1>Jev Decision Tester</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message to evaluate..."
        style={{ width: '100%', height: '100px', marginBottom: '1rem' }}
      />
      <br />
      <button onClick={handleEvaluate} disabled={loading}>
        {loading ? 'Evaluating...' : 'Test Jev Decision'}
      </button>

      {error && (
        <pre
          style={{
            background: '#fdecea',
            color: '#611a15',
            padding: '1rem',
            marginTop: '1rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error}
        </pre>
      )}

      {result && (
        <pre style={{ background: '#f4f4f4', padding: '1rem', marginTop: '1rem' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
