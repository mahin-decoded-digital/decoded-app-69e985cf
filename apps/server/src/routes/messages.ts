import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

const defaultMessages = [
  {
    id: 'msg1',
    senderId: 'p1',
    receiverId: 'h1',
    text: 'Hi Jane, I noticed your iron is a bit low. I recommend adding more spinach this week.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  }
]

router.get('/', async (req, res) => {
  let docs = await db.collection('messages').find()
  if (docs.length === 0) {
    for (const m of defaultMessages) {
      await db.collection('messages').insertOne(m)
    }
    docs = await db.collection('messages').find()
  }
  res.json(docs)
  return
})

router.post('/', async (req, res) => {
  const insertedId = await db.collection('messages').insertOne(req.body as Record<string, unknown>)
  const doc = await db.collection('messages').findById(insertedId)
  res.status(201).json(doc)
  return
})

export default router