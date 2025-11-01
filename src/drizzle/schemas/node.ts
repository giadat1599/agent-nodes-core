import { randomUUID } from "node:crypto"
import { relations } from "drizzle-orm"
import { json, pgEnum, pgTable, text } from "drizzle-orm/pg-core"
import { timestamps } from "../utils"
import { connection } from "./connection"
import { workflow } from "./workflow"

export const nodeType = pgEnum("node_type", ["initial"])

export const node = pgTable("node", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	name: text("name").notNull(),
	type: nodeType("type").notNull(),
	position: json("position"),
	data: json("data").default({}),
	workflowId: text("workflow_id")
		.notNull()
		.references(() => workflow.id, { onDelete: "cascade" }),
	...timestamps(),
})

export const nodeRelations = relations(node, ({ many, one }) => ({
	workflow: one(workflow, { fields: [node.workflowId], references: [workflow.id] }),
	outputConnections: many(connection),
	inputConnections: many(connection),
}))
