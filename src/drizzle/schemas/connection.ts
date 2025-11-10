import { type InferSelectModel, relations } from "drizzle-orm"
import { pgTable, text, unique } from "drizzle-orm/pg-core"
import { v4 as uuidv4 } from "uuid"
import { timestamps } from "../utils"
import { node } from "./node"
import { workflow } from "./workflow"

export const connection = pgTable(
	"connection",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => uuidv4()),
		fromNodeId: text("from_node_id")
			.notNull()
			.references(() => node.id, { onDelete: "cascade" }),
		toNodeId: text("to_node_id")
			.notNull()
			.references(() => node.id, { onDelete: "cascade" }),
		fromOutput: text("from_output").default("main"),
		toInput: text("to_input").default("main"),
		workflowId: text("workflow_id")
			.notNull()
			.references(() => workflow.id, { onDelete: "cascade" }),
		...timestamps(),
	},
	(table) => [unique("connection_unique_idx").on(table.fromNodeId, table.toNodeId, table.fromOutput, table.toInput)],
)

export const connectionRelations = relations(connection, ({ one }) => ({
	fromNode: one(node, {
		fields: [connection.fromNodeId],
		references: [node.id],
	}),
	toNode: one(node, {
		fields: [connection.toNodeId],
		references: [node.id],
	}),
	workflow: one(workflow, { fields: [connection.workflowId], references: [workflow.id] }),
}))

export type Connection = InferSelectModel<typeof connection>
