import { financialDictionary } from './dictionary';

export function useFinanceDictionary(term: string) {
  if (!term) return null;
  for (const [category, terms] of Object.entries(financialDictionary.categories)) {
    const match = terms.find(
      (t) => t.term.toLowerCase() === term.toLowerCase()
    );
    if (match) return { ...match, category };
  }
  return null;
}
