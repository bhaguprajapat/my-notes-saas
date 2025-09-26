import { useEffect, useState } from 'react';
import Router from 'next/router';

function authFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  return fetch(path, {
    ...opts,
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}`, ...(opts.headers||{}) }
  });
}

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tenant, setTenant] = useState({ plan: 'free', slug: '' });
  const [me, setMe] = useState(null);

  useEffect(()=> {
    const token = localStorage.getItem('token');
    if (!token) Router.push('/');
    load();
  }, []);

  async function load() {
    const tslug = localStorage.getItem('tenantSlug');
    const resT = await authFetch(`/tenants/${tslug}`);
    if (resT.ok) {
      const t = await resT.json(); setTenant(t);
    }
    const res = await authFetch('/notes');
    if (!res.ok) {
      if (res.status === 401) Router.push('/');
      return;
    }
    setNotes(await res.json());
  }

  async function createNote(e) {
    e?.preventDefault();
    const res = await authFetch('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });
    if (!res.ok) {
      alert((await res.json()).error);
      return;
    }
    setTitle(''); setContent('');
    load();
  }

  async function del(id) {
    const res = await authFetch(`/notes/${id}`, { method: 'DELETE' });
    if (res.status === 204) load();
  }

  async function upgrade() {
    const tslug = localStorage.getItem('tenantSlug');
    const res = await authFetch(`/tenants/${tslug}/upgrade`, { method: 'POST' });
    if (!res.ok) { alert('Upgrade failed'); return; }
    alert('Tenant upgraded to Pro');
    load();
  }

  const reachedLimit = tenant.plan === 'free' && notes.length >= 3;

  return (
    <div style={{ maxWidth: 780, margin: '30px auto', fontFamily: 'sans-serif' }}>
      <h1>Notes ({tenant.slug}) — plan: {tenant.plan}</h1>

      <form onSubmit={createNote}>
        <input placeholder="title" value={title} onChange={e=>setTitle(e.target.value)} />
        <br />
        <textarea placeholder="content" value={content} onChange={e=>setContent(e.target.value)} />
        <br/>
        <button type="submit">Create</button>
      </form>

      {reachedLimit && (
        <div style={{ marginTop: 12, padding: 10, border: '1px solid orange' }}>
          <strong>Free plan limit reached (3 notes)</strong>
          <br/>
          <button onClick={upgrade}>Upgrade to Pro</button>
        </div>
      )}

      <ul>
        {notes.map(n => (
          <li key={n.id} style={{ margin: 10, borderBottom:'1px solid #ddd', paddingBottom:8}}>
            <h4>{n.title}</h4>
            <p>{n.content}</p>
            <small>{new Date(n.createdAt).toLocaleString()}</small>
            <br/>
            <button onClick={()=>del(n.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
