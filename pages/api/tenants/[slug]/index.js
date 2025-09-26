import prisma from '../../../../lib/prisma';
import { getUserFromReq } from '../../../../lib/auth';
import withCors from '../../../../lib/cors';

export default async function handler(req,res) {
  if (withCors(req,res)) return;
  const slug = req.query.slug;
  // auth required
  const me = await getUserFromReq(req);
  if (!me) return res.status(401).json({ error: 'Unauthorized' });
  const tenant = await prisma.tenant.findUnique({ where: { slug }});
  if (!tenant || tenant.id !== me.user.tenantId) return res.status(404).json({ error: 'Not found' });
  res.json({ id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan });
}
