export function createCache({ ttlMs, maxEntries }) {
  const entries = new Map(); // key -> { value, expiresAt }

  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= Date.now()) {
        entries.delete(key);
        return undefined;
      }
      entries.delete(key); // Reinsertion : it's become the most recent
      entries.set(key, entry);
      return entry.value;
    },
    set(key, value) {
      entries.delete(key);
      entries.set(key, { value, expiresAt: Date.now() + ttlMs });
      if (entries.size > maxEntries) {
        entries.delete(entries.keys().next().value); // The first key is the less recent
      }
    },
  };
}
