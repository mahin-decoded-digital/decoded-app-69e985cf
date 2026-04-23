import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, LogOut, User, Calendar, BookOpen, Package, Camera, MessageCircle, LayoutGrid, ChevronRight, Lightbulb, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const clientNavItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
  { label: 'Scan', to: '/scan', icon: Camera },
  { label: 'Inventory', to: '/inventory', icon: Package },
  { label: 'Recipes', to: '/recipes', icon: BookOpen },
  { label: 'Planner', to: '/planner', icon: Calendar },
  { label: 'Family', to: '/profile', icon: Users },
  { label: 'Messages', to: '/messages', icon: MessageCircle },
];

const professionalNavItems = [
  { label: 'Clients', to: '/dashboard', icon: LayoutGrid },
  { label: 'Messages', to: '/messages', icon: MessageCircle },
];

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'PROFESSIONAL' ? professionalNavItems : clientNavItems;
  const ThemeIcon = theme === 'dark' ? Star : Lightbulb;

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:shrink-0 md:flex-col md:border-r md:bg-background md:min-h-screen transition-all duration-200',
          collapsed ? 'md:w-20' : 'md:w-64'
        )}
      >
        <div className={cn('flex items-center px-6 py-6 text-fuchsia-600', collapsed ? 'justify-center' : 'justify-between')}>
          <Link to="/dashboard" className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
            <Heart className="h-6 w-6" fill="currentColor" />
            {!collapsed && <span className="font-bold text-xl tracking-tight">Nourish & Nest</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn('text-muted-foreground hover:text-fuchsia-600', collapsed && 'hidden')}
            onClick={() => setCollapsed(true)}
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
        </div>

        {collapsed && (
          <div className="flex justify-center pb-4">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        <nav className={cn('flex-1 space-y-1', collapsed ? 'px-2' : 'px-4')}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors',
                    collapsed ? 'justify-center px-2' : 'px-3',
                    isActive
                      ? 'bg-fuchsia-50 text-fuchsia-700'
                      : 'text-foreground hover:bg-muted hover:text-fuchsia-600'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {!collapsed && item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className={cn('pb-6 space-y-2', collapsed ? 'px-2' : 'px-4')}>
          <Button
            variant="ghost"
            className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
            size={collapsed ? 'icon' : 'default'}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <ThemeIcon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
            {!collapsed && (theme === 'dark' ? 'Light mode' : 'Dark mode')}
          </Button>
          {user?.role === 'CLIENT' && (
            <Button
              variant="ghost"
              className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
              size={collapsed ? 'icon' : 'default'}
              asChild
            >
              <Link to="/profile">
                <User className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                {!collapsed && 'Profile'}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
            size={collapsed ? 'icon' : 'default'}
            onClick={handleLogout}
          >
            <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
            {!collapsed && 'Log out'}
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-fuchsia-600">
            <Heart className="h-5 w-5" fill="currentColor" />
            <span className="font-bold text-lg tracking-tight">Nourish & Nest</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <ThemeIcon className="h-5 w-5" />
            </Button>
            {user?.role === 'CLIENT' && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/messages">
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </Button>
            )}
            {user?.role === 'CLIENT' && (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      {user?.role === 'CLIENT' && (
        <nav className="md:hidden fixed bottom-0 w-full bg-background border-t flex justify-around p-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          {[
            { label: 'Scan', to: '/scan', icon: Camera },
            { label: 'Inventory', to: '/inventory', icon: Package },
            { label: 'Recipes', to: '/recipes', icon: BookOpen },
            { label: 'Planner', to: '/planner', icon: Calendar },
          ].map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 text-[10px] font-medium transition-colors',
                    isActive ? 'text-fuchsia-600' : 'text-muted-foreground hover:text-fuchsia-600'
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      )}
    </>
  );
}