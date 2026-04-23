import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

const defaultRecipes = [
  {
    id: 'r1',
    title: 'Folate-Rich Salmon & Quinoa Bowl',
    description: 'A nutrient-dense bowl perfect for pregnancy, rich in Omega-3s and folate.',
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    prepTimeMinutes: 25,
    suitableStages: ['PRECONCEPTION', 'TRIMESTER_1', 'TRIMESTER_2', 'TRIMESTER_3', 'POSTPARTUM', 'RECOVERY'],
    nutritionSummary: { calories: 450, protein: 32, folate: 120, dha: 400 },
    ingredients: [
      { name: 'Salmon', amount: 1, unit: 'fillets' },
      { name: 'Quinoa', amount: 100, unit: 'grams' },
      { name: 'Spinach', amount: 1, unit: 'bags' },
      { name: 'Avocado', amount: 0.5, unit: 'count' },
    ],
    allergens: ['Fish'],
  },
  {
    id: 'r2',
    title: 'Energy-Boosting Egg & Avocado Toast',
    description: 'Quick protein and healthy fats for the 4th trimester recovery.',
    imageUrl: 'https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg',
    prepTimeMinutes: 10,
    suitableStages: ['TRIMESTER_1', 'TRIMESTER_2', 'TRIMESTER_3', 'POSTPARTUM', 'RECOVERY'],
    nutritionSummary: { calories: 320, protein: 18, iron: 2 },
    ingredients: [
      { name: 'Eggs', amount: 2, unit: 'count' },
      { name: 'Avocado', amount: 0.5, unit: 'count' },
    ],
    allergens: ['Eggs', 'Wheat'],
  },
  {
    id: 'r3',
    title: 'Iron-Fortified Chicken & Spinach Stir-Fry',
    description: 'Replenish iron stores postpartum with this easy, comforting stir-fry.',
    imageUrl: 'https://images.pexels.com/photos/2313686/pexels-photo-2313686.jpeg',
    prepTimeMinutes: 20,
    suitableStages: ['TRIMESTER_2', 'TRIMESTER_3', 'POSTPARTUM', 'RECOVERY'],
    nutritionSummary: { calories: 380, protein: 38, iron: 6 },
    ingredients: [
      { name: 'Chicken Breast', amount: 1, unit: 'fillets' },
      { name: 'Spinach', amount: 1, unit: 'bags' },
    ],
    allergens: [],
  }
]

router.get('/', async (req, res) => {
  let docs = await db.collection('recipes').find()
  if (docs.length === 0) {
    for (const r of defaultRecipes) {
      await db.collection('recipes').insertOne(r)
    }
    docs = await db.collection('recipes').find()
  }
  res.json(docs)
  return
})

export default router