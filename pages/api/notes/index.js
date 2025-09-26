import prisma from '../../../lib/prisma';
import { getUserFromReq } from '../../../lib/auth';
import withCors from '../../../lib/cors';

export default async function handler(req, res) {
  if (withCors(req,res)) return;
  const me = await getUserFromReq(req);
  if (!me) return res.status(401).json({ error: 'Unauthorized' });

  const { user } = me;
  const tenantId = user.tenantId;

  if (req.method === 'GET') {
    const notes = await prisma.note.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(notes);
  }

  if (req.method === 'POST') {
    const { title, content } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });

    // Enforce Free plan limit (3 notes max)
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }});
    if (tenant.plan === 'free') {
      const count = await prisma.note.count({ where: { tenantId }});
      if (count >= 3) {
        return res.status(403).json({ error: 'Free plan note limit reached' });
      }
    }

    const note = await prisma.note.create({
      data: { title, content: content || '', tenantId, authorId: user.id }
    });
    return res.status(201).json(note);
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).end();
}
