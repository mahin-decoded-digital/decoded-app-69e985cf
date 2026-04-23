import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Heart, Lightbulb, Star, Loader2 } from 'lucide-react';
import { Role } from '../types';
import { useTheme } from '@/hooks/useTheme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('CLIENT');
  const login = useAuthStore(state => state.login);
  const loading = useAuthStore(state => state.loading);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === 'dark' ? Star : Lightbulb;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await login({
      email,
      role,
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <ThemeIcon className="h-5 w-5" />
        </Button>
      </div>
      <Card className="w-full max-w-md shadow-lg border-fuchsia-100">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-fuchsia-100 p-3 rounded-full text-fuchsia-600">
              <Heart className="h-8 w-8" fill="currentColor" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Nourish & Nest</CardTitle>
          <CardDescription>Sign in to manage your stage-aware meal plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client (Expecting / Postpartum)</SelectItem>
                  <SelectItem value="PROFESSIONAL">Nutritionist / Chef</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-fuchsia-600 hover:bg-fuchsia-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Demo version. Use any email to sign in.
        </CardFooter>
      </Card>
    </div>
  );
}