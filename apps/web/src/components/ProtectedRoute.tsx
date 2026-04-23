import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Lightbulb, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useHouseholdStore } from '@/stores/householdStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { useMessageStore } from '@/stores/messageStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { Navbar } from './Navbar';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './ui/button';

export function ProtectedRoute({ requireRole }: { requireRole?: 'CLIENT' | 'PROFESSIONAL' }) {
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === 'dark' ? Star : Lightbulb;

  const fetchHouseholds = useHouseholdStore(s => s.fetchAll);
  const fetchInventory = useInventoryStore(s => s.fetchAll);
  const fetchMealPlans = useMealPlanStore(s => s.fetchAll);
  const fetchMessages = useMessageStore(s => s.fetchAll);
  const fetchRecipes = useRecipeStore(s => s.fetchAll);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHouseholds();
      fetchInventory();
      fetchMealPlans();
      fetchMessages();
      fetchRecipes();
    }
  }, [isAuthenticated, user, fetchHouseholds, fetchInventory, fetchMealPlans, fetchMessages, fetchRecipes]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background md:flex">
      <Navbar />
      <main className="flex-1 w-full p-4 md:p-8 pb-20 md:pb-8">
        <div className="flex justify-end pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <ThemeIcon className="h-4 w-4 mr-2" />
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}