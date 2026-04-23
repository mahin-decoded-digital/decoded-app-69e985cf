import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

const defaultHouseholds = [
  {
    id: 'h1',
    name: 'Smith Family',
    professionalId: 'p1',
    members: [
      {
        id: 'm1',
        name: 'Jane Smith',
        stage: 'TRIMESTER_2',
        allergies: ['Peanuts'],
        medicalConditions: ['Gestational Diabetes'],
        dietaryRestrictions: [],
        servingsMultiplier: 1,
      },
      {
        id: 'm2',
        name: 'John Smith',
        stage: 'PRECONCEPTION',
        allergies: [],
        medicalConditions: [],
        dietaryRestrictions: ['Vegetarian'],
        servingsMultiplier: 1.5,
      }
    ]
  }
]

router.get('/', async (req, res) => {
  let docs = await db.collection('households').find()
  if (docs.length === 0) {
    for (const h of defaultHouseholds) {
      await db.collection('households').insertOne(h)
    }
    docs = await db.collection('households').find()
  }
  res.json(docs)
  return
})

router.post('/', async (req, res) => {
  const insertedId = await db.collection('households').insertOne(req.body as Record<string, unknown>)
  const doc = await db.collection('households').findById(insertedId)
  res.status(201).json(doc)
  return
})

router.put('/:id', async (req, res) => {
  const docs = await db.collection('households').find()
  const target = docs.find(d => d.id === String(req.params.id))
  if (!target) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  await db.collection('households').updateOne(target._id, req.body as Record<string, unknown>)
  const updated = await db.collection('households').findById(target._id)
  res.json(updated)
  return
})

router.post('/:id/members', async (req, res) => {
  const docs = await db.collection('households').find()
  const target = docs.find(d => d.id === String(req.params.id))
  if (!target) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const members = Array.isArray(target.members) ? target.members : []
  members.push(req.body)
  await db.collection('households').updateOne(target._id, { members })
  const updated = await db.collection('households').findById(target._id)
  res.json(updated)
  return
})

router.put('/:id/members/:memberId', async (req, res) => {
  const docs = await db.collection('households').find()
  const target = docs.find(d => d.id === String(req.params.id))
  if (!target) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const memberId = String(req.params.memberId)
  const members = Array.isArray(target.members) ? target.members : []
  const newMembers = members.map((m: any) => m.id === memberId ? { ...m, ...(req.body as any) } : m)
  await db.collection('households').updateOne(target._id, { members: newMembers })
  const updated = await db.collection('households').findById(target._id)
  res.json(updated)
  return
})

router.delete('/:id/members/:memberId', async (req, res) => {
  const docs = await db.collection('households').find()
  const target = docs.find(d => d.id === String(req.params.id))
  if (!target) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const memberId = String(req.params.memberId)
  const members = Array.isArray(target.members) ? target.members : []
  const newMembers = members.filter((m: any) => m.id !== memberId)
  await db.collection('households').updateOne(target._id, { members: newMembers })
  const updated = await db.collection('households').findById(target._id)
  res.json(updated)
  return
})

export default router