
export const parseNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;
  
  // Remover espacios y limpiar el valor
  let cleanValue = value.trim();
  
  // Si tiene formato europeo (ejemplo: 3.273.161,04)
  if (cleanValue.includes(',') && cleanValue.split(',').length === 2) {
    // Separar parte entera y decimal
    const parts = cleanValue.split(',');
    const integerPart = parts[0].replace(/\./g, ''); // Remover puntos de miles
    const decimalPart = parts[1];
    cleanValue = integerPart + '.' + decimalPart;
  } else {
    // Solo remover puntos si no hay coma (números enteros con miles)
    cleanValue = cleanValue.replace(/\./g, '');
  }
  
  // Remover caracteres no numéricos excepto punto decimal y signo negativo
  cleanValue = cleanValue.replace(/[^\d.-]/g, '');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};
