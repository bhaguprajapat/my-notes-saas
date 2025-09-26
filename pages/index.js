import { useState } from 'react';
import Router from 'next/router';

export default function Login() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('password');

  async function submit(e) {
    e.preventDefault();
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      alert('Login failed');
      return;
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('tenantSlug', data.tenant.slug);
    Router.push('/notes');
  }

  return (
    <div style={{ maxWidth: 540, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
        </div>
        <div>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Use seed users: admin@acme.test / user@acme.test, password: password</p>
    </div>
  );
}
