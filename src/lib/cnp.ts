/** Cifrele de control ale CNP-ului, în ordinea primelor 12 cifre. */
const CONTROL = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

/** Secolul nașterii, după prima cifră (1–8). 7–8 = rezidenți străini, fără secol. */
const CENTURY: Record<string, number | undefined> = {
  "1": 1900,
  "2": 1900,
  "3": 1800,
  "4": 1800,
  "5": 2000,
  "6": 2000,
};

/** CNP valid: 13 cifre, cu cifra de control corectă. */
export function isValidCnp(cnp: string): boolean {
  if (!/^[1-9]\d{12}$/.test(cnp)) return false;
  const sum = CONTROL.reduce((acc, w, i) => acc + w * Number(cnp[i]), 0);
  const control = sum % 11 === 10 ? 1 : sum % 11;
  return control === Number(cnp[12]);
}

/** Data nașterii (AAAA-LL-ZZ) din CNP, sau null dacă nu se poate deduce. */
export function birthDateFromCnp(cnp: string): string | null {
  if (!isValidCnp(cnp)) return null;
  const century = CENTURY[cnp[0]];
  if (century === undefined) return null;
  const year = century + Number(cnp.slice(1, 3));
  const month = cnp.slice(3, 5);
  const day = cnp.slice(5, 7);
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.getUTCDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}
