import { useAuthStore } from '../stores/authStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useHouseholdStore } from '../stores/householdStore';
import { useRecipeStore } from '../stores/recipeStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Calendar, Camera, Package, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { items } = useInventoryStore();
  const { entries } = useMealPlanStore();
  const { households } = useHouseholdStore();
  const { recipes } = useRecipeStore();

  if (!user) return null;

  if (user.role === 'PROFESSIONAL') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-fuchsia-900">Professional Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your clients and meal plans.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(households).map(household => (
            <Card key={household.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {household.name}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{household.members.length} members</div>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  {household.members.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <span className="font-medium">{m.name}:</span>
                      <Badge variant="outline">{m.stage.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200" asChild>
                  <Link to={`/messages?client=${household.id}`}>Message Client</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // CLIENT Dashboard
  const household = households[user.householdId];
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = entries.filter(e => e.date === today && e.householdId === user.householdId);
  
  const expiringSoon = items.filter(item => {
    const daysToExpiry = (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return daysToExpiry >= 0 && daysToExpiry <= 3;
  });

  const expired = items.filter(item => new Date(item.expiryDate) < new Date());

  return (
    <div className="space-y-8 mb-16 md:mb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-fuchsia-900">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground mt-2">Here is what's happening with your meals today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" /> Quick Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-pink-100 mb-4">Update your fridge inventory in seconds.</p>
            <Button variant="secondary" className="w-full text-fuchsia-700 bg-white hover:bg-gray-100" asChild>
              <Link to="/scan">Scan Fridge</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringSoon.length} items</div>
            <p className="text-xs text-muted-foreground">expiring within 3 days</p>
            {expired.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {expired.length} items expired!
              </div>
            )}
            <Button variant="link" className="px-0 mt-2 text-fuchsia-600" asChild>
              <Link to="/inventory">View Fridge →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Meals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMeals.length} planned</div>
            <div className="text-xs text-muted-foreground mt-1">
              {todayMeals.length === 0 ? "Nothing scheduled for today." : "You're on track!"}
            </div>
            <Button variant="link" className="px-0 mt-2 text-fuchsia-600" asChild>
              <Link to="/planner">Open Planner →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Today's Menu</h2>
        {todayMeals.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2 opacity-50" />
              <p>No meals planned for today.</p>
              <Button variant="outline" className="mt-4 text-fuchsia-600" asChild>
                <Link to="/recipes">Find Recipes</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {todayMeals.map(meal => {
              const recipe = recipes.find(r => r.id === meal.recipeId);
              if (!recipe) return null;
              return (
                <Card key={meal.id} className="flex overflow-hidden">
                  <div className="w-1/3 bg-muted">
                    <img src={recipe.imageUrl} alt={recipe.title} crossOrigin="anonymous" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4 w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2">{meal.mealType}</Badge>
                      </div>
                      <h3 className="font-semibold line-clamp-1">{recipe.title}</h3>
                      <p className="text-sm text-muted-foreground">{meal.servings} servings</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
