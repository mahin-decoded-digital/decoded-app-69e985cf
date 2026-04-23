import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

router.get('/', async (req, res) => {
  const docs = await db.collection('mealPlans').find()
  res.json(docs)
  return
})

router.post('/', async (req, res) => {
  const insertedId = await db.collection('mealPlans').insertOne(req.body as Record<string, unknown>)
  const doc = await db.collection('mealPlans').findById(insertedId)
  res.status(201).json(doc)
  return
})

router.delete('/:id', async (req, res) => {
  const docs = await db.collection('mealPlans').find()
  const target = docs.find(d => d.id === String(req.params.id))
  if (!target) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await db.collection('mealPlans').deleteOne(target._id)
  res.json({ success: true })
  return
})

export default router