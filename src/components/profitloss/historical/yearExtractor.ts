
export const extractYearsFromHeader = (headerLine: string): number[] => {
  // Extract years from header line
  const exercisePattern = /ejercicio\s+(\d{4})/gi;
  const yearPattern = /\b(20\d{2})\b/g;
  
  let years: number[] = [];
  let match;
  
  // Try to find "ejercicio YYYY" patterns first
  while ((match = exercisePattern.exec(headerLine)) !== null) {
    const year = parseInt(match[1]);
    if (year >= 2000 && year <= 2050 && !years.includes(year)) {
      years.push(year);
    }
  }
  
  // If no exercise patterns found, look for standalone years
  if (years.length === 0) {
    while ((match = yearPattern.exec(headerLine)) !== null) {
      const year = parseInt(match[1]);
      if (year >= 2000 && year <= 2050 && !years.includes(year)) {
        years.push(year);
      }
    }
  }
  
  const sortedYears = years.sort((a, b) => a - b);
  return sortedYears;
};
