
export const extractYearsFromHeader = (headerLine: string): number[] => {
  console.log('=== EXTRACTING YEARS FROM HEADER ===');
  console.log('Header line:', headerLine);
  
  const years: number[] = [];
  
  // Buscar específicamente "Ejerc. YYYY" o similar
  const exerciseMatches = headerLine.match(/ejerc\.?\s*(\d{4})/gi);
  
  console.log('Exercise matches found:', exerciseMatches);
  
  if (exerciseMatches) {
    exerciseMatches.forEach(match => {
      const yearMatch = match.match(/(\d{4})/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= 2000 && year <= 2050 && !years.includes(year)) {
          years.push(year);
        }
      }
    });
  }
  
  // Si no encuentra con "Ejerc.", buscar años directamente
  if (years.length === 0) {
    const directYearMatches = headerLine.match(/\b(20\d{2})\b/g);
    if (directYearMatches) {
      directYearMatches.forEach(yearStr => {
        const year = parseInt(yearStr);
        if (!years.includes(year)) {
          years.push(year);
        }
      });
    }
  }
  
  const sortedYears = years.sort((a, b) => b - a);
  console.log('Final sorted years:', sortedYears);
  return sortedYears;
};
