import { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [badgeNumber, setBadgeNumber] = useState('AAT-0001');
  const [password, setPassword] = useState('ChangeMe@123');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/auth/authority/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badgeNumber, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || 'Login failed');
      return;
    }

    onLogin(payload.token);
  }

  return (
    <main className="auth-shell">
      <form className="panel" onSubmit={handleSubmit}>
        <h2>Authority Login</h2>
        <label>
          Badge Number
          <input value={badgeNumber} onChange={(event) => setBadgeNumber(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Access Dashboard</button>
      </form>
    </main>
  );
}
