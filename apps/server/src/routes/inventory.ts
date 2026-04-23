import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

const defaultItems = [
  { id: 'i1', householdId: 'h1', name: 'Spinach', quantity: 2, unit: 'bags', expiryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], category: 'Produce' },
  { id: 'i2', householdId: 'h1', name: 'Eggs', quantity: 12, unit: 'count', expiryDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], category: 'Dairy' },
  { id: 'i3', householdId: 'h1', name: 'Salmon', quantity: 2, unit: 'fillets', expiryDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0], category: 'Meat' },
  { id: 'i4', householdId: 'h1', name: 'Quinoa', quantity: 500, unit: 'grams', expiryDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0], category: 'Pantry' },
  { id: 'i5', householdId: 'h1', name: 'Avocado', quantity: 3, unit: 'count', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], category: 'Produce' },
  { id: 'i6', householdId: 'h1', name: 'Chicken Breast', quantity: 4, unit: 'fillets', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], category: 'Meat' },
  { id: 'i7', householdId: 'h1', name: 'Milk', quantity: 1, unit: 'gallon', expiryDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], category: 'Dairy' },
]

router.get('/', async (req, res) => {
  let docs = await db.collection('inventory').find()
  if (docs.length === 0) {
    for (const item of defaultItems) {
      await db.collection('inventory').insertOne(item)
    }
    docs = await db.collection('inventory').find()
  }
  res.json(docs)
  return
})

router.post('/', async (req, res) => {
  const insertedId = await db.collection('inventory').insertOne(req.body as Record<string, unknown>)
  const doc = await db.collection('inventory').findById(insertedId)
  res.status(201).json(doc)
  return
})

router.post('/bulk', async (req, res) => {
  const items = req.body as unknown[]
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Expected array' })
    return
  }
  const inserted = []
  for (const item of items) {
    const insertedId = await db.collection('inventory').insertOne(item as Record<string, unknown>)
    const doc = await db.collection('inventory').findById(insertedId)
    inserted.push(doc)
  }
  res.status(201).json(inserted)
  return
})

router.put('/:id', async (req, res) => {
  const docs = await db.collection('inventory').find()
  const target = docs.find(d => d.id === String(req.params.id))
  if (!target) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await db.collection('inventory').updateOne(target._id, req.body as Record<string, unknown>)
  const updated = await db.collection('inventory').findById(target._id)
  res.json(updated)
  return
})

router.delete('/:id', async (req, res) => {
  const docs = await db.collection('inventory').find()
  const target = docs.find(d => d.id === String(req.params.id))
  if (!target) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await db.collection('inventory').deleteOne(target._id)
  res.json({ success: true })
  return
})

export default router