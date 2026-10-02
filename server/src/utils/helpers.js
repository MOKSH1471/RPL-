/**
 * Helper to look up an answer value regardless of snake_case, camelCase, or case-insensitive casing.
 */
export function getFieldValue(answers, fieldKey) {
  if (!answers || typeof answers !== 'object') return undefined;
  if (answers[fieldKey] !== undefined && answers[fieldKey] !== null && answers[fieldKey] !== '') {
    return answers[fieldKey];
  }

  // snake_case -> camelCase (e.g. tshirt_size -> tshirtSize, date_of_birth -> dateOfBirth)
  const camelKey = fieldKey.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  if (answers[camelKey] !== undefined && answers[camelKey] !== null && answers[camelKey] !== '') {
    return answers[camelKey];
  }

  // camelCase -> snake_case (e.g. tshirtSize -> tshirt_size)
  const snakeKey = fieldKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  if (answers[snakeKey] !== undefined && answers[snakeKey] !== null && answers[snakeKey] !== '') {
    return answers[snakeKey];
  }

  // Case-insensitive / underscore-insensitive lookup
  const cleanKey = fieldKey.toLowerCase().replace(/_/g, '');
  for (const [k, v] of Object.entries(answers)) {
    if (k.toLowerCase().replace(/_/g, '') === cleanKey && v !== undefined && v !== null && v !== '') {
      return v;
    }
  }

  return undefined;
}

/**
 * Helper to sanitize DATE values for MySQL (YYYY-MM-DD).
 */
export function sanitizeDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }
  const str = String(val).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}
