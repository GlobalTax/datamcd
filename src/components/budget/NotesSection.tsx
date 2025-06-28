
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ValuationBudgetFormData } from '@/types/budget';

interface NotesSectionProps {
  formData: ValuationBudgetFormData;
  onInputChange: (field: keyof ValuationBudgetFormData, value: string | number) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => onInputChange('notes', e.target.value)}
          placeholder="Añade cualquier nota o comentario adicional..."
          rows={3}
        />
      </CardContent>
    </Card>
  );
};
