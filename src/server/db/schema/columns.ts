// Column types Drizzle does not ship natively.

import { customType } from "drizzle-orm/pg-core"

// Drizzle's own full-text-search guide computes `to_tsvector()` inline in the
// WHERE clause, which defeats the GIN index and table-scans the corpus. We
// declare a real tsvector column instead and let it be a stored generated
// column, so the index is usable (design §6).
export const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tsvector"
  },
})
