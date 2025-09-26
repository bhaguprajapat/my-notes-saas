import prisma from '../../../../lib/prisma';
import { getUserFromReq } from '../../../../lib/auth';
import withCors from '../../../../lib/cors';

export default async function handler(req,res) {
  if (withCors(req,res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const me = await getUserFromReq(req);
  if (!me) return res.status(401).json({ error: 'Unauthorized' });
  if (me.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can upgrade' });

  const slug = req.query.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug }});
  if (!tenant || tenant.id !== me.user.tenantId) return res.status(404).json({ error: 'Not found' });

  await prisma.tenant.update({ where: { id: tenant.id }, data: { plan: 'pro' }});
  res.json({ message: 'Upgraded to pro' });
}
