import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const analyses = pgTable('analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  imageUrl: text('image_url').notNull(),
  extractedText: text('extracted_text'),
  hiddenRisks: jsonb('hidden_risks'),
  moneyTraps: jsonb('money_traps'),
  autoRenewTraps: jsonb('auto_renew_traps'),
  dangerousClauses: jsonb('dangerous_clauses'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
