import { randomUUID } from "node:crypto"
import { pgTable, text } from "drizzle-orm/pg-core"

export const workflow = pgTable("workflow", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	name: text("name").notNull(),
})
