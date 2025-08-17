import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRestaurantContext } from "@/providers/RestaurantContext";
import { useFranchiseeRestaurants } from "@/hooks/useFranchiseeRestaurants";
import { SearchableRestaurantSelect } from "@/components/ui/searchable-restaurant-select";
import { useRestaurantRoutes } from "@/hooks/useRestaurantRoutes";

interface CountChip {
  label: string;
  value: number | string;
}

interface AppNavbarProps {
  title?: string;
  subtitle?: string;
  counts?: CountChip[];
  onSignOut?: () => void;
  onOpenSidebar?: () => void; // Para abrir el menú lateral propio de la página
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  title = "Inicio",
  subtitle,
  counts = [],
  onSignOut,
  onOpenSidebar,
}) => {
  const { currentRestaurantId, setRestaurantId } = useRestaurantContext();
  const { restaurants, loading: restaurantsLoading } = useFranchiseeRestaurants();
  const { getCurrentRestaurantRoutes } = useRestaurantRoutes();
  const navigate = useNavigate();

  useEffect(() => {
    // SEO básico: actualizar el título del documento
    const brand = "McDonald's Portal";
    document.title = `${title} · ${brand}`.slice(0, 60);
  }, [title]);

  // Obtener rutas para el restaurante actual
  const restaurantRoutes = getCurrentRestaurantRoutes();

  // Navitems actualizados para usar rutas basadas en restaurante
  const navItems = [
    { 
      label: "Hub", 
      href: restaurantRoutes?.hub || "/dashboard",
      fallback: "/dashboard"
    },
    { 
      label: "Personal", 
      href: restaurantRoutes?.staff || "/employees",
      fallback: "/employees"
    },
    { 
      label: "Presupuestos", 
      href: restaurantRoutes?.budget || "/annual-budget",
      fallback: "/annual-budget"
    },
    { 
      label: "Financiero", 
      href: restaurantRoutes?.profitLoss || "/profit-loss",
      fallback: "/profit-loss"
    },
    { 
      label: "Incidencias", 
      href: restaurantRoutes?.incidents || "/incidents",
      fallback: "/incidents"
    },
    { 
      label: "Análisis", 
      href: restaurantRoutes?.analytics || "/analysis",
      fallback: "/analysis"
    },
    { label: "Franquiciados", href: "/franchisees" },
    { label: "Advisor", href: "/advisor" },
    { label: "Ajustes", href: "/settings" },
  ];

  // Manejar cambio de restaurante
  const handleRestaurantChange = (value: string | null) => {
    setRestaurantId(value);
    
    // Si hay un restaurante seleccionado, navegar a su hub
    if (value && restaurantRoutes) {
      navigate(`/restaurant/${value}/hub`);
    }
  };

  return (
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b animate-fade-in" role="banner">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-1 rounded">
          Saltar al contenido
        </a>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between">
          {/* IZQUIERDA: botón móvil + branding */}
          <div className="flex items-center gap-3">
            {onOpenSidebar ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menú"
                className="lg:hidden"
                onClick={onOpenSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            ) : (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <nav className="mt-6 grid gap-1" aria-label="Navegación móvil">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm ${isActive ? "bg-muted text-foreground" : "hover:bg-muted/60"}`
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-semibold">M</span>
              </div>
              <div className="leading-tight">
                <span className="text-sm font-semibold text-foreground">{title}</span>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* SELECTOR DE RESTAURANTE (solo desktop) */}
          <div className="hidden lg:flex items-center">
            <div className="w-80">
              <SearchableRestaurantSelect
                restaurants={restaurants.map(r => ({
                  id: r.id,
                  name: r.base_restaurant?.restaurant_name || 'Sin nombre',
                  site_number: r.base_restaurant?.site_number || '',
                  franchisee_name: r.base_restaurant?.franchisee_name
                }))}
                value={currentRestaurantId || ''}
                onValueChange={handleRestaurantChange}
                placeholder="Seleccionar restaurante..."
                loading={restaurantsLoading}
                disabled={restaurantsLoading}
                compact
              />
            </div>
          </div>

          {/* CENTRO: navegación (desktop) */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Navegación principal">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `story-link px-3 py-2 rounded-md text-sm transition ${isActive ? "bg-muted text-foreground" : "hover:bg-muted/60"}`
                }
                end
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* DERECHA: contadores + acciones */}
          <div className="flex items-center gap-2">
            {counts?.map((c) => (
              <Badge key={c.label} variant="secondary" className="hidden sm:inline-flex">
                {c.value} {c.label}
              </Badge>
            ))}
            {onSignOut && (
              <Button variant="outline" size="sm" onClick={onSignOut} aria-label="Cerrar sesión">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
