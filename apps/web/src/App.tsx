import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FridgeScan from './pages/FridgeScan';
import Inventory from './pages/Inventory';
import RecipeMatch from './pages/RecipeMatch';
import MealPlanner from './pages/MealPlanner';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Client and Professional shared/protected paths */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
      </Route>

      {/* Client specific paths */}
      <Route element={<ProtectedRoute requireRole="CLIENT" />}>
        <Route path="/scan" element={<FridgeScan />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/recipes" element={<RecipeMatch />} />
        <Route path="/planner" element={<MealPlanner />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
