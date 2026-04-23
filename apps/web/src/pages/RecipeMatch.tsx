import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecipeStore } from '../stores/recipeStore';
import { useAuthStore } from '../stores/authStore';
import { useHouseholdStore } from '../stores/householdStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Clock, Flame, CheckCircle, AlertTriangle } from 'lucide-react';

export default function RecipeMatch() {
  const { user } = useAuthStore();
  const { recipes } = useRecipeStore();
  const { households } = useHouseholdStore();
  const { items } = useInventoryStore();
  
  const [maxTime, setMaxTime] = useState<string>('any');
  const [nutritionFocus, setNutritionFocus] = useState<string>('any');

  if (!user) return null;
  const household = households[user.householdId];
  if (!household) return null;

  // Aggregate household allergies
  const allAllergies = household.members.flatMap(m => m.allergies).map(a => a.toLowerCase());

  // Inventory logic: checking what we have
  const inventoryNames = items.filter(i => i.householdId === user.householdId).map(i => i.name.toLowerCase());

  const filteredRecipes = recipes.filter(recipe => {
    if (maxTime !== 'any' && recipe.prepTimeMinutes > parseInt(maxTime)) return false;
    
    if (nutritionFocus === 'folate' && !recipe.nutritionSummary.folate) return false;
    if (nutritionFocus === 'iron' && !recipe.nutritionSummary.iron) return false;
    if (nutritionFocus === 'dha' && !recipe.nutritionSummary.dha) return false;

    // Check allergies
    const hasAllergen = recipe.allergens.some(a => allAllergies.includes(a.toLowerCase()));
    if (hasAllergen) return false; // In a real app we might show it with a warning, but filtering is safer.

    return true;
  }).map(recipe => {
    // Calculate missing ingredients
    const missing = recipe.ingredients.filter(ing => !inventoryNames.includes(ing.name.toLowerCase()));
    return { ...recipe, missingCount: missing.length, missingNames: missing.map(m => m.name) };
  }).sort((a, b) => a.missingCount - b.missingCount); // Rank by least missing ingredients

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-fuchsia-900">Recipe Matches</h1>
        <p className="text-muted-foreground mt-2">Stage-appropriate recipes based on what's in your fridge.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-lg border">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Max Prep Time</label>
          <Select value={maxTime} onValueChange={setMaxTime}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="15">15 mins or less</SelectItem>
              <SelectItem value="30">30 mins or less</SelectItem>
              <SelectItem value="60">1 hour or less</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Nutrition Focus</label>
          <Select value={nutritionFocus} onValueChange={setNutritionFocus}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="General Balance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">General Balance</SelectItem>
              <SelectItem value="folate">High Folate</SelectItem>
              <SelectItem value="iron">Iron-Rich</SelectItem>
              <SelectItem value="dha">DHA / Omega-3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-lg border-2 border-dashed">
            No recipes found matching these filters. Try clearing them.
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <Card key={recipe.id} className="overflow-hidden flex flex-col hover:border-fuchsia-300 transition-colors">
              <div className="h-48 relative">
                <img src={recipe.imageUrl} alt={recipe.title} crossOrigin="anonymous" className="w-full h-full object-cover" />
                {recipe.missingCount === 0 && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
                    <CheckCircle className="h-3 w-3" /> All ingredients
                  </div>
                )}
                {recipe.missingCount > 0 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow">
                    <AlertTriangle className="h-3 w-3" /> Missing {recipe.missingCount}
                  </div>
                )}
              </div>
              <CardContent className="p-4 flex-1">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2">{recipe.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-700">
                    <Clock className="h-3 w-3" /> {recipe.prepTimeMinutes}m
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-700">
                    <Flame className="h-3 w-3" /> {recipe.nutritionSummary.calories} kcal
                  </Badge>
                  {recipe.nutritionSummary.folate && (
                    <Badge variant="outline" className="border-fuchsia-200 text-fuchsia-700">Folate-rich</Badge>
                  )}
                  {recipe.nutritionSummary.iron && (
                    <Badge variant="outline" className="border-pink-200 text-pink-700">Iron-rich</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                {recipe.missingCount > 0 && (
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    Need: {recipe.missingNames.join(', ')}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100" asChild>
                  <Link to={`/planner?recipe=${recipe.id}`}>Add to Plan</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
