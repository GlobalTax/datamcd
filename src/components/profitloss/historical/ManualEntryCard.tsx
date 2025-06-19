
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ManualEntryCardProps {
  onManualEntry: () => void;
}

export const ManualEntryCard: React.FC<ManualEntryCardProps> = ({ onManualEntry }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Carga Manual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Introduce los datos año por año usando formularios
        </p>
        
        <div className="py-8 text-center">
          <Plus className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            Formularios interactivos para cada año
          </p>
        </div>

        <Button 
          onClick={onManualEntry}
          className="w-full"
        >
          Comenzar Carga Manual
        </Button>
      </CardContent>
    </Card>
  );
};
