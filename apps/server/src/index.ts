import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './lib/db.js'

import authRoutes from './routes/auth.js'
import householdRoutes from './routes/households.js'
import inventoryRoutes from './routes/inventory.js'
import mealPlanRoutes from './routes/meal-plans.js'
import messageRoutes from './routes/messages.js'
import recipeRoutes from './routes/recipes.js'

// ── Environment validation ──
const isProd = process.env.PROD === 'true'
const hasMongoUri = !!process.env.MONGODB_URI
console.log('[server] Environment:')
console.log('  PROD (deployment tier):', isProd ? '✓ true' : '✗ false (dev/preview)')
console.log('  MONGODB_URI:', hasMongoUri ? '✓ configured' : '✗ not set (in-memory DB)')
if (isProd && !hasMongoUri) {
  console.warn('[server] ⚠ PROD=true but MONGODB_URI is not set — using in-memory storage')
}

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001

app.use(cors({ origin: '*' }))
app.use(express.json())

// ── Request logging ──
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`[api] ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: db.isProduction() ? 'mongodb' : 'in-memory' })
})

// --- API routes ---
app.use('/api/auth', authRoutes)
app.use('/api/households', householdRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/meal-plans', mealPlanRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/recipes', recipeRoutes)

// ── Error handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[server] API server running on http://localhost:${PORT}`)
  console.log(`[server] DB mode: ${db.isProduction() ? 'MongoDB' : 'In-memory'}`)
})

export { app, db }