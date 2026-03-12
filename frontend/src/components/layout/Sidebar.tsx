import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  BarChart3,
  Calendar,
  Factory,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Masters',
    icon: Settings,
    children: [
      { title: 'Machines', href: '/masters/machines' },
      { title: 'Operators', href: '/masters/operators' },
      { title: 'Raw Materials', href: '/masters/materials' },
      { title: 'Components', href: '/masters/components' },
      { title: 'Moulds', href: '/masters/moulds' },
      { title: 'BOM Setup', href: '/masters/bom' },
    ],
  },
  {
    title: 'Planning',
    href: '/planning',
    icon: Calendar,
  },
  {
    title: 'Production',
    icon: Factory,
    children: [
      { title: 'New Entry', href: '/production/new' },
      { title: 'View Reports', href: '/production/list' },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    children: [
      { title: 'Daily Report', href: '/reports/daily' },
      { title: 'Machine Analysis', href: '/reports/machine' },
      { title: 'Operator Analysis', href: '/reports/operator' },
      { title: 'Rejection Analysis', href: '/reports/rejection' },
      { title: 'Downtime Analysis', href: '/reports/downtime' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Masters', 'Production', 'Reports']);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-transform duration-300 ease-in-out',
        // Mobile: slide in/out
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-slate-700/50">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50 rounded-full"></div>
          <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Factory className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h1 style={{ color: '#FFFFFF' }} className="text-xl font-extrabold tracking-wide">
            RAM INDUSTRIES
          </h1>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-yellow-400" />
            <p style={{ color: '#FCD34D' }} className="text-xs font-semibold tracking-wide">Production MIS</p>
          </div>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem-4.5rem)]">
        {navItems.map((item) => (
          <div key={item.title}>
            {item.href ? (
              <NavLink
                to={item.href}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </NavLink>
            ) : (
              <>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      expandedItems.includes(item.title) && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence>
                  {expandedItems.includes(item.title) && item.children && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-4 overflow-hidden"
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            cn(
                              'block rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                              isActive
                                ? 'bg-blue-500/20 text-blue-400 font-medium border-l-2 border-blue-500 -ml-[18px] pl-[26px]'
                                : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                            )
                          }
                        >
                          {child.title}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            RK
          </div>
          <div>
            <p className="text-sm font-medium text-white">Rajesh Kumar</p>
            <p className="text-xs text-slate-400">Plant Supervisor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
