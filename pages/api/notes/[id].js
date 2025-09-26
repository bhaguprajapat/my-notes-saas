import prisma from '../../../lib/prisma';
import { getUserFromReq } from '../../../lib/auth';
import withCors from '../../../lib/cors';

export default async function handler(req, res) {
  if (withCors(req,res)) return;
  const me = await getUserFromReq(req);
  if (!me) return res.status(401).json({ error: 'Unauthorized' });

  const { user } = me;
  const id = Number(req.query.id);

  const note = await prisma.note.findUnique({ where: { id }});
  if (!note || note.tenantId !== user.tenantId) return res.status(404).json({ error: 'Not found' });

  if (req.method === 'GET') return res.json(note);

  if (req.method === 'PUT') {
    const { title, content } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const updated = await prisma.note.update({ where: { id }, data: { title, content }});
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.note.delete({ where: { id }});
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET,PUT,DELETE');
  res.status(405).end();
}
