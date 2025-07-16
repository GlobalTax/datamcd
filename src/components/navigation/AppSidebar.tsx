
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
} from '@/components/ui/sidebar';
import { Home, Settings, LogOut, Cog, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedAuth } from '@/hooks/auth/useUnifiedAuth';

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Cog,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user, 
    signOut, 
    franchisee,
    isImpersonating, 
    impersonatedFranchisee,
    effectiveFranchisee,
    getDebugInfo
  } = useUnifiedAuth();

  // Determinar si el usuario es asesor
  const isAdvisor = user?.role && ['asesor', 'admin', 'superadmin', 'advisor'].includes(user.role);

  // Items del menú dinámicos según el rol
  const dynamicMenuItems = isAdvisor ? [
    ...menuItems,
    {
      title: "Panel Asesor",
      url: "/advisor",
      icon: Users,
    },
  ] : menuItems;

  // Log de debugging detallado
  const debugInfo = getDebugInfo();
  console.log('SIDEBAR DEBUG:', debugInfo);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">McDonald's</h2>
            <p className="text-xs text-gray-500">Portal de Gestión</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Servicios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {dynamicMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="w-full justify-start px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button onClick={() => navigate(item.url)}>
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="space-y-3">
          <div className={`px-3 py-2 rounded-lg ${isImpersonating ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium text-gray-900 truncate">
              {isImpersonating ? effectiveFranchisee?.franchisee_name : (user?.full_name || user?.email)}
            </p>
            <p className={`text-xs ${isImpersonating ? 'text-blue-600' : 'text-gray-500'}`}>
              {isImpersonating ? 'Franquiciado (Vista Asesor)' : 'Franquiciado'}
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
