import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import {
  Package,
  LayoutDashboard,
  LogOut,
  User,
  Tag,
  Users,
  ShoppingCart,
  ClipboardList,
  Box
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { path: '/products', label: 'Products', icon: Package, show: true },
    { path: '/categories', label: 'Categories', icon: Tag, show: isAdmin },
    { path: '/users', label: 'Users', icon: Users, show: isAdmin },
    { path: '/orders', label: 'Order Management', icon: ClipboardList, show: isAdmin },
    { path: '/my-orders', label: 'My Orders', icon: ShoppingCart, show: !isAdmin },
    { path: '/my-inventory', label: 'My Inventory', icon: Box, show: !isAdmin },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="font-bold text-xl">POSTQODE NEXUS</span>
            </Link>

            <Separator orientation="vertical" className="h-6" />

            <nav className="flex items-center gap-1">
              {navItems.map(
                (item) =>
                  item.show && (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive(item.path) ? 'default' : 'ghost'}
                        size="sm"
                        className="gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      {user?.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-slate-500">
                      {user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
