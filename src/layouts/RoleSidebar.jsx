import { useLocation, Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, CreditCard, Package,
  ShoppingCart, RotateCcw, FileText, BarChart2, Settings,
  AlertTriangle, ClipboardList, MapPin, Phone, Star,
  Truck, Warehouse, Tags, Archive, X, ChevronLeft, ChevronRight,
  MessageSquare, Activity, DollarSign, TrendingUp, BoxSelect
} from 'lucide-react';

const NAV = {
  CEO: [
    { label: 'Dashboard', href: '/ceo', icon: LayoutDashboard },
    { label: 'Customers', href: '/ceo/customers', icon: Users },
    { label: 'Employees', href: '/ceo/employees', icon: UserCheck },
    { label: 'Orders', href: '/ceo/orders', icon: ShoppingCart },
    { label: 'Returns', href: '/ceo/returns', icon: RotateCcw },
    { label: 'Financials', href: '/ceo/financials', icon: DollarSign },
    { label: 'Warehouse', href: '/ceo/warehouse', icon: Warehouse },
    { label: 'Reports', href: '/ceo/reports', icon: BarChart2 },
    { label: 'Settings', href: '/ceo/settings', icon: Settings },
  ],
  CRE: [
    { label: 'Dashboard', href: '/cre', icon: LayoutDashboard },
    { label: 'Applications', href: '/cre/applications', icon: ClipboardList },
    { label: 'Customers', href: '/cre/customers', icon: Users },
    { label: 'My Team', href: '/cre/team', icon: UserCheck },
    { label: 'Escalations', href: '/cre/escalations', icon: AlertTriangle },
    { label: 'Tickets', href: '/cre/tickets', icon: MessageSquare },
  ],
  CREM: [
    { label: 'Dashboard', href: '/crem', icon: LayoutDashboard },
    { label: 'My Customers', href: '/crem/customers', icon: Users },
    { label: 'Leads', href: '/crem/leads', icon: Star },
    { label: 'Visits', href: '/crem/visits', icon: MapPin },
    { label: 'Follow-Ups', href: '/crem/follow-ups', icon: Phone },
    { label: 'Tickets', href: '/crem/tickets', icon: MessageSquare },
    { label: 'Tasks', href: '/crem/tasks', icon: ClipboardList },
    { label: 'Reports', href: '/crem/reports', icon: BarChart2 },
  ],
  AE: [
    { label: 'Dashboard', href: '/ae', icon: LayoutDashboard },
    { label: 'Applications', href: '/ae/applications', icon: ClipboardList },
    { label: 'Customers', href: '/ae/customers', icon: Users },
    { label: 'Invoices', href: '/ae/invoices', icon: FileText },
    { label: 'Payments', href: '/ae/payments', icon: CreditCard },
    { label: 'Outstanding', href: '/ae/outstanding', icon: TrendingUp },
    { label: 'Collections', href: '/ae/collections', icon: DollarSign },
    { label: 'Reports', href: '/ae/reports', icon: BarChart2 },
  ],
  WE: [
    { label: 'Dashboard', href: '/we', icon: LayoutDashboard },
    { label: 'Products', href: '/we/products', icon: Package },
    { label: 'Categories', href: '/we/categories', icon: Tags },
    { label: 'Inventory', href: '/we/inventory', icon: Archive },
    { label: 'Orders', href: '/we/orders', icon: ShoppingCart },
    { label: 'Returns', href: '/we/returns', icon: RotateCcw },
    { label: 'Staff', href: '/we/staff', icon: UserCheck },
    { label: 'Reports', href: '/we/reports', icon: BarChart2 },
  ],
  WS: [
    { label: 'Dashboard', href: '/ws', icon: LayoutDashboard },
    { label: 'My Orders', href: '/ws/orders', icon: ShoppingCart },
    { label: 'My Returns', href: '/ws/returns', icon: RotateCcw },
  ],
};

const ROLE_COLORS = {
  CEO: 'bg-purple-100 text-purple-700',
  CRE: 'bg-blue-100 text-blue-700',
  CREM: 'bg-cyan-100 text-cyan-700',
  AE: 'bg-green-100 text-green-700',
  WE: 'bg-orange-100 text-orange-700',
  WS: 'bg-yellow-100 text-yellow-700',
};

function NavItem({ item, collapsed, active }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? 'bg-brand-50 text-brand-700'
          : 'text-text-secondary hover:bg-surface-100 hover:text-text-primary'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
      title={collapsed ? item.label : undefined}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-brand-600' : ''}`} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function RoleSidebar({ collapsed, onCollapse, onClose }) {
  const { user } = useAuth();
  const [location] = useLocation();

  const items = NAV[user?.role] || [];
  const roleColor = ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-700';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center h-16 px-4 border-b border-surface-200 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="text-base font-bold text-text-primary tracking-tight">GangaMaxx</span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onCollapse}
            className="hidden lg:flex p-1.5 rounded-md text-text-muted hover:bg-surface-100 hover:text-text-primary"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-text-muted hover:bg-surface-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role badge */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.email}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleColor}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {items.map((item) => {
          const active = location === item.href || (item.href !== '/' && location.startsWith(item.href + '/'));
          return (
            <NavItem key={item.href} item={item} collapsed={collapsed} active={active} />
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="p-2 border-t border-surface-200 space-y-0.5">
        <NavItem
          item={{ label: 'Profile', href: '/profile', icon: UserCheck }}
          collapsed={collapsed}
          active={location.startsWith('/profile')}
        />
        <NavItem
          item={{ label: 'Notifications', href: '/notifications', icon: ClipboardList }}
          collapsed={collapsed}
          active={location === '/notifications'}
        />
      </div>
    </div>
  );
}
