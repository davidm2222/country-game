import Fuse from 'fuse.js';
import { COUNTRIES, COUNTRY_BY_NAME } from './countries';
import { Continent, Country, MatchResult } from '@/types';

// Build a flat list of searchable entries: each alias/name maps back to its country.
// This lets Fuse.js score individual alias strings rather than arrays.
interface SearchEntry {
  term: string;
  country: Country;
}

const searchEntries: SearchEntry[] = COUNTRIES.flatMap(c => [
  { term: c.name.toLowerCase(), country: c },
  ...c.aliases.map(a => ({ term: a.toLowerCase(), country: c })),
]);

const fuse = new Fuse(searchEntries, {
  keys: ['term'],
  threshold: 0.4,       // 0 = exact match, 1 = match anything
  ignoreLocation: true, // match anywhere in the string, not just the beginning
  minMatchCharLength: 2,
  includeScore: true,
});

/**
 * Attempt to match a user's input to a country.
 * - exact (score < 0.1): high confidence, auto-add
 * - duplicate: already in the player's list
 * - none: no acceptable match
 */
export function matchCountry(
  input: string,
  alreadyEntered: string[],
  continent?: Continent
): MatchResult {
  const trimmed = input.trim();
  if (!trimmed) return { type: 'none' };

  // Check for exact match first (case-insensitive) before fuzzy search
  const exactByName = COUNTRY_BY_NAME.get(trimmed.toLowerCase());
  if (exactByName) {
    if (continent && exactByName.continent !== continent) return { type: 'out_of_scope', country: exactByName };
    if (alreadyEntered.includes(exactByName.name)) {
      return { type: 'duplicate', country: exactByName };
    }
    return { type: 'exact', country: exactByName };
  }

  const results = fuse.search(trimmed);
  if (results.length === 0) return { type: 'none' };

  const best = results[0];
  const score = best.score ?? 1;
  const country = best.item.country;

  if (continent && country.continent !== continent) return { type: 'out_of_scope', country };

  if (alreadyEntered.includes(country.name)) {
    return { type: 'duplicate', country };
  }

  if (score < 0.1) {
    return { type: 'exact', country };
  }

  return { type: 'none' };
}
