import { Bell, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white/95 backdrop-blur-xl px-4 lg:px-8 py-3 lg:py-4 border-b border-slate-200 shadow-sm">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg lg:text-2xl font-bold text-slate-800 truncate">
          {title}
        </h1>
        {subtitle && <p className="text-xs lg:text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 lg:gap-4 ml-2">
        {/* Search - Desktop only */}
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="w-48 pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500"
          />
        </div>

        {/* Date - Tablet+ */}
        <div className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm text-slate-500 bg-slate-50 px-2 lg:px-3 py-1.5 rounded-lg">
          <Calendar className="h-3.5 w-3.5" />
          <span>{today}</span>
        </div>

        {/* Current Shift Badge */}
        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-2 lg:px-3 py-1 text-xs font-medium shadow-sm">
          Day
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-lg h-9 w-9">
          <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-slate-600" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
