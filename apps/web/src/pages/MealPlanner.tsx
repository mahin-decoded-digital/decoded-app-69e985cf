import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useRecipeStore } from '../stores/recipeStore';
import { useAuthStore } from '../stores/authStore';
import { useHouseholdStore } from '../stores/householdStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

export default function MealPlanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRecipeId = searchParams.get('recipe');

  const { user } = useAuthStore();
  const { entries, addEntry, removeEntry } = useMealPlanStore();
  const { recipes } = useRecipeStore();
  const { households } = useHouseholdStore();

  const [isAddOpen, setIsAddOpen] = useState(!!initialRecipeId);
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialRecipeId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'>('DINNER');

  useEffect(() => {
    if (initialRecipeId) {
      setSelectedRecipeId(initialRecipeId);
      setIsAddOpen(true);
    }
  }, [initialRecipeId]);

  if (!user) return null;
  const household = households[user.householdId];
  if (!household) return null;

  // Calculate default servings based on household members
  const totalServings = household.members.reduce((acc, m) => acc + m.servingsMultiplier, 0);

  // Generate next 7 days
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId || !selectedDate) return;

    addEntry({
      id: Math.random().toString(36).substr(2, 9),
      householdId: user.householdId,
      memberId: 'all', // simplify for now, means whole household
      recipeId: selectedRecipeId,
      date: selectedDate,
      servings: totalServings,
      mealType: selectedMeal,
    });

    setIsAddOpen(false);
    if (initialRecipeId) setSearchParams({});
  };

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) return 'Today';
    const isTomorrow = date.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();
    if (isTomorrow) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-fuchsia-900">Meal Planner</h1>
          <p className="text-muted-foreground mt-1">Schedule your meals. Servings are auto-adjusted for your household.</p>
        </div>
        <Button className="bg-fuchsia-600 hover:bg-fuchsia-700" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Meal
        </Button>
      </div>

      <div className="grid gap-6">
        {days.map(dateStr => {
          const dayMeals = entries.filter(e => e.date === dateStr && e.householdId === user.householdId);
          
          return (
            <Card key={dateStr} className={dayMeals.length === 0 ? "bg-slate-50 border-dashed" : ""}>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 p-4 bg-slate-100/50 border-b md:border-b-0 md:border-r flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border">
                    <CalendarIcon className="h-5 w-5 text-fuchsia-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{getDayLabel(dateStr)}</h3>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  {dayMeals.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground py-4">
                      No meals scheduled.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayMeals.map(meal => {
                        const recipe = recipes.find(r => r.id === meal.recipeId);
                        if (!recipe) return null;
                        return (
                          <div key={meal.id} className="relative group bg-white border rounded-lg p-3 shadow-sm">
                            <div className="text-xs font-semibold text-fuchsia-600 mb-1">{meal.mealType}</div>
                            <div className="font-medium line-clamp-1">{recipe.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {meal.servings} servings (auto)
                            </div>
                            <button 
                              onClick={() => removeEntry(meal.id)}
                              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Manual Dialog to Add */}
      {isAddOpen && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Meal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMeal} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Recipe</Label>
                <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Meal Type</Label>
                  <Select value={selectedMeal} onValueChange={(v: any) => setSelectedMeal(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                      <SelectItem value="LUNCH">Lunch</SelectItem>
                      <SelectItem value="DINNER">Dinner</SelectItem>
                      <SelectItem value="SNACK">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!selectedRecipeId} className="bg-fuchsia-600">Save to Plan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
