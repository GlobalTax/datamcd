
// Re-export the main parsing function for backward compatibility
export { parseDetailedDataFromText } from './detailedParser';

// Re-export other utilities that might be used elsewhere
export { convertDetailedToStandard, createEmptyDetailedYearlyData } from './dataConverter';
export { parseNumber } from './numberParser';
export { extractYearsFromHeader } from './yearExtractor';
export { conceptMapping, normalizeConceptName, isHeaderOrTotalLine } from './conceptMapping';
