import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

router.post('/login', async (req, res) => {
  const body = req.body as { email?: string; role?: string }
  const role = body.role === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'CLIENT'
  const email = body.email || 'user@example.com'
  
  const user = {
    id: role === 'CLIENT' ? 'u1' : 'p1',
    name: email.split('@')[0],
    email,
    role,
    householdId: role === 'CLIENT' ? 'h1' : 'h_dummy',
    token: 'dummy-token-' + Date.now()
  }
  
  await db.collection('users').updateOne(user.id, user)
  res.json(user)
  return
})

export default router