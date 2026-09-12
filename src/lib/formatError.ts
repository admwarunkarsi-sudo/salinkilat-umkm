/**
 * Helper to safely extract user-friendly string messages from any error,
 * preventing "[object Object]" from ever appearing in the UI.
 */
export function formatErrorMessage(
  err: unknown,
  fallback = 'Terjadi kendala saat memproses permintaan. Silakan klik "Coba Lagi".'
): string {
  if (err === null || err === undefined) {
    return fallback;
  }

  // 1. Primitive string
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (!trimmed || trimmed === '[object Object]' || trimmed === 'Error') {
      return fallback;
    }

    // If string is JSON-encoded (e.g. from fetch error payload or API body)
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        const extracted = formatErrorMessage(parsed, '');
        if (extracted) return extracted;
      } catch {
        // Not valid JSON, keep going
      }
    }

    return trimmed;
  }

  // 2. Objects (Error instances, custom objects, fetch response bodies)
  if (typeof err === 'object') {
    const obj = err as Record<string, any>;

    // Handle standard AbortError / Timeout
    if (obj.name === 'AbortError' || obj.code === 20) {
      return 'Permintaan melebihi batas waktu (timeout). Silakan periksa koneksi internet Anda dan klik "Coba Lagi".';
    }

    // Check nested `error` property
    if (obj.error !== undefined && obj.error !== null) {
      const nested = formatErrorMessage(obj.error, '');
      if (nested && nested !== '[object Object]') {
        return nested;
      }
    }

    // Check standard `message` property
    if (typeof obj.message === 'string' && obj.message.trim()) {
      const msg = obj.message.trim();
      if (msg !== '[object Object]' && msg !== 'Error') {
        // If message itself is stringified JSON
        if (msg.startsWith('{') && msg.endsWith('}')) {
          try {
            const parsed = JSON.parse(msg);
            const nested = formatErrorMessage(parsed, '');
            if (nested) return nested;
          } catch {
            // Not JSON
          }
        }
        return msg;
      }
    }

    // Check `detail` or `details` (often used by FastAPI/Django/NestJS)
    if (typeof obj.detail === 'string' && obj.detail.trim() && obj.detail !== '[object Object]') {
      return obj.detail.trim();
    }
    if (typeof obj.details === 'string' && obj.details.trim() && obj.details !== '[object Object]') {
      return obj.details.trim();
    }

    // Check `msg`
    if (typeof obj.msg === 'string' && obj.msg.trim() && obj.msg !== '[object Object]') {
      return obj.msg.trim();
    }

    // Check response.data or data
    if (obj.data && typeof obj.data === 'object') {
      const extractedData = formatErrorMessage(obj.data, '');
      if (extractedData && extractedData !== '[object Object]') {
        return extractedData;
      }
    }

    // Check HTTP statusText if present
    if (typeof obj.statusText === 'string' && obj.statusText.trim()) {
      return `Server mengembalikan status: ${obj.statusText}`;
    }

    // If object has string values (e.g. form validation map)
    try {
      const stringValues = Object.values(obj)
        .filter((v) => typeof v === 'string' && v.trim() && v !== '[object Object]')
        .map((v) => (v as string).trim());

      if (stringValues.length > 0) {
        return stringValues.join('. ');
      }
    } catch {
      // Ignore
    }
  }

  // 3. Fallback
  return fallback;
}
