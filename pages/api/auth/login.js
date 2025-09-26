import prisma from '../../../lib/prisma';
import { comparePassword, signToken } from '../../../lib/auth';
import withCors from '../../../lib/cors';

export default async function handler(req, res) {
  if (withCors(req,res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId }});

  const token = signToken({ userId: user.id, role: user.role, tenantId: tenant.id, tenantSlug: tenant.slug });

  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, tenantSlug: tenant.slug },
    tenant: { slug: tenant.slug, plan: tenant.plan }
  });
}
