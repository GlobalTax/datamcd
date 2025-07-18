
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FeatureCards = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      {/* Franquiciados Card */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white cursor-pointer" onClick={() => navigate('/auth')}>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Store className="w-7 h-7 text-red-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
          </div>
          <CardTitle className="text-2xl text-gray-900 mt-4">Portal de Franquiciados</CardTitle>
          <p className="text-gray-600 text-base">
            Gestiona tu restaurante, analiza tu rendimiento financiero y accede a herramientas de valoración.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Análisis Profit & Loss detallado</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Gestión completa de restaurantes</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Valoración profesional de franquicias</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asesores Card */}
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white cursor-pointer" onClick={() => navigate('/advisor-auth')}>
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <CardTitle className="text-2xl text-gray-900 mt-4">Portal de Asesores</CardTitle>
          <p className="text-gray-600 text-base">
            Panel administrativo completo para gestionar franquiciados, restaurantes y asignaciones.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Gestión avanzada de franquiciados</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Base de datos de restaurantes</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Reportes y análisis detallados</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
