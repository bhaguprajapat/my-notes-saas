import prisma from '../../../../lib/prisma';
import { getUserFromReq, hashPassword } from '../../../../lib/auth';
import withCors from '../../../../lib/cors';

export default async function handler(req,res){
  if (withCors(req,res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { email, role } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });

  const me = await getUserFromReq(req);
  if (!me) return res.status(401).json({ error: 'Unauthorized' });
  if (me.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can invite' });

  const slug = req.query.slug;
  const tenant = await prisma.tenant.findUnique({ where: { slug }});
  if (!tenant || tenant.id !== me.user.tenantId) return res.status(404).json({ error: 'Not found' });

  const pwdHash = await hashPassword('password'); // default temporary password
  const user = await prisma.user.create({
    data: { email, password: pwdHash, role: role === 'admin' ? 'admin' : 'member', tenantId: tenant.id }
  });
  // do not return password
  const { password, ...rest } = user;
  res.status(201).json(rest);
}
