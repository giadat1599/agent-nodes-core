import { randomUUID } from "node:crypto"
import { type InferSelectModel, relations } from "drizzle-orm"
import { index, pgTable, text } from "drizzle-orm/pg-core"
import { timestamps } from "../utils"
import { user } from "./auth"
import { connection } from "./connection"
import { node } from "./node"

export const workflow = pgTable(
	"workflow",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		name: text("name").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		...timestamps(),
	},
	(table) => [index("workflow_user_id_name_idx").on(table.userId, table.name)],
)

export const workflowRelations = relations(workflow, ({ one, many }) => ({
	user: one(user, { fields: [workflow.userId], references: [user.id] }),
	nodes: many(node),
	connections: many(connection),
}))

export type Workflow = InferSelectModel<typeof workflow>
