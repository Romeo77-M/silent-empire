import { chartTerms } from './chart_terms_dictionary';

export function useChartDictionary(term: string) {
  if (!term) return null;
  // This is a simplified direct lookup since chartTerms is an object
  return (chartTerms as any)[term] || null;
}
