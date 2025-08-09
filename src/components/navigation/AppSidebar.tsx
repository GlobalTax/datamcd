
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Calculator, Calendar, Database, Home, Settings, LogOut, Building, BarChart3, Users, Cog, AlertTriangle, Receipt, UserCheck, Store, FileText, Bell, TrendingUp, Activity, Monitor, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/AuthProvider';
import { logger } from '@/lib/logger';

type GeneralMenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
};

type AdvisorMenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  hash: string;
};

const generalMenuItems: GeneralMenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Restaurantes",
    url: "/restaurant",
    icon: Store,
  },
  {
    title: "Franquiciados",
    url: "/franchisees",
    icon: Building,
  },
  {
    title: "Empleados",
    url: "/employees",
    icon: Users,
  },
  {
    title: "Análisis",
    url: "/analysis",
    icon: BarChart3,
  },
  {
    title: "Valoración",
    url: "/valuation",
    icon: Calculator,
  },
  {
    title: "Presupuestos Anuales",
    url: "/annual-budget",
    icon: Calendar,
  },
  {
    title: "Datos Históricos",
    url: "/historical-data",
    icon: Database,
  },
  {
    title: "Orquest",
    url: "/orquest",
    icon: Cog,
  },
  {
    title: "Incidencias",
    url: "/incidents",
    icon: AlertTriangle,
  },
  {
    title: "Biloop",
    url: "/biloop",
    icon: Receipt,
  },
  {
    title: "Panel Trabajadores",
    url: "/workers",
    icon: UserCheck,
  },
];

const advisorMenuItems: AdvisorMenuItem[] = [
  {
    title: "Dashboard",
    url: "/advisor",
    icon: LayoutDashboard,
    hash: "dashboard",
  },
  {
    title: "Franquiciados",
    url: "/advisor",
    icon: Building,
    hash: "franchisees",
  },
  {
    title: "Restaurantes",
    url: "/advisor",
    icon: Store,
    hash: "restaurants",
  },
  {
    title: "Analytics",
    url: "/advisor",
    icon: BarChart3,
    hash: "analytics",
  },
  {
    title: "Reportes",
    url: "/advisor",
    icon: FileText,
    hash: "reports",
  },
  {
    title: "Alertas",
    url: "/advisor",
    icon: Bell,
    hash: "notifications",
  },
  {
    title: "Valoración",
    url: "/advisor",
    icon: TrendingUp,
    hash: "valuation",
  },
  {
    title: "Presupuestos",
    url: "/advisor",
    icon: Activity,
    hash: "budgets",
  },
  {
    title: "Orquest",
    url: "/advisor",
    icon: Monitor,
    hash: "orquest",
  },
  {
    title: "Biloop",
    url: "/advisor",
    icon: Receipt,
    hash: "biloop",
  },
  {
    title: "Incidencias",
    url: "/advisor",
    icon: AlertTriangle,
    hash: "incidents",
  },
  {
    title: "Gestión",
    url: "/advisor",
    icon: Users,
    hash: "management",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user, 
    signOut, 
    franchisee,
    getDebugInfo
  } = useAuth();

  const { setOpen, isMobile } = useSidebar();

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const update = () => {
      if (!isMobile && mq.matches) {
        setOpen(false);
      }
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [isMobile, setOpen]);

  // Log de debugging detallado
  const debugInfo = getDebugInfo?.() || {};
  logger.debug('Sidebar debug info', { 
    component: 'AppSidebar',
    debugInfo
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Determine which menu items to show based on current route
  const isAdvisorPage = location.pathname === '/advisor';
  const menuItems = isAdvisorPage ? advisorMenuItems : generalMenuItems;

  // Handle navigation for advisor page with internal tabs
  const handleNavigation = (item: GeneralMenuItem | AdvisorMenuItem) => {
    if (isAdvisorPage && 'hash' in item) {
      // For advisor page, we need to trigger the internal tab change
      // This will be handled by posting a message to update the advisor page state
      window.postMessage({ type: 'ADVISOR_TAB_CHANGE', tab: item.hash }, '*');
    } else {
      navigate(item.url);
    }
  };

  // Determine active state for advisor tabs
  const isActiveItem = (item: GeneralMenuItem | AdvisorMenuItem) => {
    if (isAdvisorPage && 'hash' in item) {
      // For advisor page, check if it's the current tab (this is simplified)
      return location.pathname === item.url;
    }
    return location.pathname === item.url;
  };

  const pick = (titles: string[], source: (GeneralMenuItem | AdvisorMenuItem)[]) =>
    source.filter((it) => titles.includes(it.title));

  const generalGroups = [
    { label: 'Principal', items: pick(['Dashboard'], generalMenuItems) },
    { label: 'Operaciones', items: pick(['Restaurantes','Franquiciados','Empleados','Incidencias','Orquest','Panel Trabajadores','Biloop'], generalMenuItems) },
    { label: 'Finanzas', items: pick(['Análisis','Valoración','Presupuestos Anuales','Datos Históricos'], generalMenuItems) },
  ];

  const advisorGroups = [
    { label: 'Principal', items: pick(['Dashboard'], advisorMenuItems) },
    { label: 'Gestión', items: pick(['Franquiciados','Restaurantes','Incidencias','Orquest','Biloop'], advisorMenuItems) },
    { label: 'Insights', items: pick(['Analytics','Reportes','Valoración','Presupuestos','Alertas'], advisorMenuItems) },
  ];

  const groups = isAdvisorPage ? advisorGroups : generalGroups;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[hsl(var(--mcd-red))] rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-[11px]">M</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">McDonald's</h2>
            <p className="text-[11px] text-gray-500">Gestión</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {groups.map((group, gi) => (
          <React.Fragment key={group.label}>
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActiveItem(item)}
                        size="sm"
                        tooltip={item.title}
                        className="w-full justify-start px-2.5 py-1.5 gap-2 rounded-md"
                      >
                        <button onClick={() => handleNavigation(item)}>
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {gi < groups.length - 1 && <SidebarSeparator className="my-1.5" />}
          </React.Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="space-y-3">
          <div className="px-3 py-2 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-gray-500">
              Administrador
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              className="flex-1 justify-start px-3"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
