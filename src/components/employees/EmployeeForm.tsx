import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeFormData } from '@/types/employee';

interface EmployeeFormProps {
  employee?: any;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EmployeeFormData>({
    defaultValues: employee || {
      vacation_days_per_year: 22,
      weekly_hours: 40,
      contract_type: 'indefinido',
      salary_frequency: 'mensual',
      schedule_type: 'fijo'
    }
  });

  const contractType = watch('contract_type');
  const salaryFrequency = watch('salary_frequency');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="contract">Contrato</TabsTrigger>
          <TabsTrigger value="salary">Salario</TabsTrigger>
          <TabsTrigger value="additional">Adicional</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_number">Número de Empleado *</Label>
                  <Input
                    id="employee_number"
                    {...register('employee_number', { required: 'Campo requerido' })}
                    placeholder="EMP001"
                  />
                  {errors.employee_number && (
                    <p className="text-sm text-red-600">{errors.employee_number.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="position">Puesto *</Label>
                  <Input
                    id="position"
                    {...register('position', { required: 'Campo requerido' })}
                    placeholder="Cajero, Cocinero, Manager..."
                  />
                  {errors.position && (
                    <p className="text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    {...register('first_name', { required: 'Campo requerido' })}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="last_name">Apellidos *</Label>
                  <Input
                    id="last_name"
                    {...register('last_name', { required: 'Campo requerido' })}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    {...register('department')}
                    placeholder="Cocina, Servicio, Administración..."
                  />
                </div>

                <div>
                  <Label htmlFor="hire_date">Fecha de Contratación *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    {...register('hire_date', { required: 'Campo requerido' })}
                  />
                  {errors.hire_date && (
                    <p className="text-sm text-red-600">{errors.hire_date.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract_type">Tipo de Contrato *</Label>
                  <Select
                    value={contractType}
                    onValueChange={(value) => setValue('contract_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="temporal">Temporal</SelectItem>
                      <SelectItem value="practicas">Prácticas</SelectItem>
                      <SelectItem value="becario">Becario</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="schedule_type">Tipo de Horario</Label>
                  <Select
                    onValueChange={(value) => setValue('schedule_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fijo">Fijo</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                      <SelectItem value="turnos">Por Turnos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contract_start_date">Inicio de Contrato *</Label>
                  <Input
                    id="contract_start_date"
                    type="date"
                    {...register('contract_start_date', { required: 'Campo requerido' })}
                  />
                  {errors.contract_start_date && (
                    <p className="text-sm text-red-600">{errors.contract_start_date.message}</p>
                  )}
                </div>

                {contractType === 'temporal' && (
                  <div>
                    <Label htmlFor="contract_end_date">Fin de Contrato</Label>
                    <Input
                      id="contract_end_date"
                      type="date"
                      {...register('contract_end_date')}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="weekly_hours">Horas Semanales</Label>
                  <Input
                    id="weekly_hours"
                    type="number"
                    step="0.5"
                    {...register('weekly_hours')}
                    placeholder="40"
                  />
                </div>

                <div>
                  <Label htmlFor="vacation_days_per_year">Días de Vacaciones/Año</Label>
                  <Input
                    id="vacation_days_per_year"
                    type="number"
                    {...register('vacation_days_per_year')}
                    placeholder="22"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Salarial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_frequency">Frecuencia de Pago</Label>
                  <Select
                    value={salaryFrequency}
                    onValueChange={(value) => setValue('salary_frequency', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="quincenal">Quincenal</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="por_horas">Por Horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div />

                {salaryFrequency === 'por_horas' ? (
                  <div>
                    <Label htmlFor="hourly_rate">Tarifa por Hora (€)</Label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      step="0.01"
                      {...register('hourly_rate')}
                      placeholder="12.50"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="base_salary">Salario Base (€)</Label>
                    <Input
                      id="base_salary"
                      type="number"
                      step="0.01"
                      {...register('base_salary')}
                      placeholder="1500.00"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="social_security_number">Número Seguridad Social</Label>
                  <Input
                    id="social_security_number"
                    {...register('social_security_number')}
                  />
                </div>

                <div>
                  <Label htmlFor="bank_account">Cuenta Bancaria (IBAN)</Label>
                  <Input
                    id="bank_account"
                    {...register('bank_account')}
                    placeholder="ES00 0000 0000 0000 0000 0000"
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_name">Contacto de Emergencia</Label>
                  <Input
                    id="emergency_contact_name"
                    {...register('emergency_contact_name')}
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergency_contact_phone"
                    {...register('emergency_contact_phone')}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    rows={3}
                    placeholder="Información adicional sobre el empleado..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {employee ? 'Actualizar' : 'Crear'} Empleado
        </Button>
      </div>
    </form>
  );
};