/**
 * Transliteration utilities
 * Konverzija između ćirilice i latinice
 */

// Ćirilica -> Latinica mapa
const CYRILLIC_TO_LATIN: Record<string, string> = {
  'А': 'A', 'а': 'a',
  'Б': 'B', 'б': 'b',
  'В': 'V', 'в': 'v',
  'Г': 'G', 'г': 'g',
  'Д': 'D', 'д': 'd',
  'Ђ': 'Đ', 'ђ': 'đ',
  'Е': 'E', 'е': 'e',
  'Ж': 'Ž', 'ж': 'ž',
  'З': 'Z', 'з': 'z',
  'И': 'I', 'и': 'i',
  'Ј': 'J', 'ј': 'j',
  'К': 'K', 'к': 'k',
  'Л': 'L', 'л': 'l',
  'Љ': 'Lj', 'љ': 'lj',
  'М': 'M', 'м': 'm',
  'Н': 'N', 'н': 'n',
  'Њ': 'Nj', 'њ': 'nj',
  'О': 'O', 'о': 'o',
  'П': 'P', 'п': 'p',
  'Р': 'R', 'р': 'r',
  'С': 'S', 'с': 's',
  'Т': 'T', 'т': 't',
  'Ћ': 'Ć', 'ћ': 'ć',
  'У': 'U', 'у': 'u',
  'Ф': 'F', 'ф': 'f',
  'Х': 'H', 'х': 'h',
  'Ц': 'C', 'ц': 'c',
  'Ч': 'Č', 'ч': 'č',
  'Џ': 'Dž', 'џ': 'dž',
  'Ш': 'Š', 'ш': 'š',
};

// Latinica -> Ćirilica mapa (reverse)
const LATIN_TO_CYRILLIC: Record<string, string> = {};
Object.entries(CYRILLIC_TO_LATIN).forEach(([cyr, lat]) => {
  LATIN_TO_CYRILLIC[lat] = cyr;
});

/**
 * Konvertuje ćirilicu u latinicu
 */
export function cyrillicToLatin(text: string): string {
  return text.split('').map(char => CYRILLIC_TO_LATIN[char] || char).join('');
}

/**
 * Konvertuje latinicu u ćirilicu
 */
export function latinToCyrillic(text: string): string {
  let result = text;
  
  // Handle digraphs first (Lj, Nj, Dž)
  result = result.replace(/Lj/g, 'Љ').replace(/lj/g, 'љ');
  result = result.replace(/Nj/g, 'Њ').replace(/nj/g, 'њ');
  result = result.replace(/Dž/g, 'Џ').replace(/dž/g, 'џ');
  
  // Then individual characters
  return result.split('').map(char => LATIN_TO_CYRILLIC[char] || char).join('');
}

/**
 * Normalizuje tekst za search - vraća oba varijanta (lat i cyr)
 */
export function normalizeForSearch(text: string): string[] {
  const normalized = text.toLowerCase().trim();
  const latin = cyrillicToLatin(normalized);
  const cyrillic = latinToCyrillic(normalized);
  
  // Vrati unique verzije
  const variants = new Set([normalized, latin, cyrillic]);
  return Array.from(variants);
}

/**
 * Proveri da li search query matchuje target text (u bilo kom pismu)
 */
export function matchesSearch(target: string, query: string): boolean {
  const targetVariants = normalizeForSearch(target);
  const queryVariants = normalizeForSearch(query);
  
  // Proveri sve kombinacije
  for (const targetVar of targetVariants) {
    for (const queryVar of queryVariants) {
      if (targetVar.includes(queryVar)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Removuje dijakritike (č, ć, š, ž, đ -> c, c, s, z, d)
 */
export function removeDiacritics(text: string): string {
  return text
    .replace(/[čČ]/g, 'c')
    .replace(/[ćĆ]/g, 'c')
    .replace(/[šŠ]/g, 's')
    .replace(/[žŽ]/g, 'z')
    .replace(/[đĐ]/g, 'd');
}
