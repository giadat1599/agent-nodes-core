import toposort = require("toposort")

import type { Connection, Node } from "../drizzle/schemas"

/**
 * Sorts workflow nodes in topological order based on their connections.
 * Topological sorting ensures that nodes are executed in dependency order,
 * where a node only runs after all its dependencies have completed.
 *
 * @param nodes - Array of workflow nodes to sort
 * @param connections - Array of connections defining dependencies between nodes
 * @returns Nodes sorted in topological order (dependencies first)
 * @throws Error if a cyclic dependency is detected in the workflow
 */
export function topologicalSort(nodes: Node[], connections: Connection[]): Node[] {
	// If there are no connections, return nodes in original order
	if (connections.length === 0) return nodes

	// Convert connections to edges: [fromNodeId, toNodeId]
	// Each edge represents "fromNode must execute before toNode"
	const edges: [string, string][] = connections.map((conn) => [conn.fromNodeId, conn.toNodeId])

	// Track which nodes are involved in connections
	const connectedNodeIds = new Set<string>()

	for (const [from, to] of edges) {
		connectedNodeIds.add(from)
		connectedNodeIds.add(to)
	}

	// Handle isolated nodes (nodes with no incoming or outgoing connections)
	// Add self-referencing edges to include them in the sort
	for (const node of nodes) {
		if (!connectedNodeIds.has(node.id)) {
			edges.push([node.id, node.id])
		}
	}

	let sortedNodeIds: string[]
	try {
		// Perform topological sort using the toposort library
		sortedNodeIds = toposort(edges)

		// Remove duplicates while preserving order
		// This is needed because isolated nodes create self-referencing edges
		const uniqueSet = new Set<string>(sortedNodeIds)
		const uniqueList: string[] = []
		uniqueSet.forEach((id) => uniqueList.push(id))

		sortedNodeIds = uniqueList
	} catch (error) {
		// Detect and handle cyclic dependencies
		// A cycle means the workflow cannot be executed (e.g., A depends on B, B depends on A)
		if (error instanceof Error && error.message.includes("Cyclic dependency")) {
			throw new Error("Cyclic dependency detected in workflow nodes")
		}
		throw error
	}

	// Map node IDs back to actual Node objects
	const nodeMap = new Map<string, Node>(nodes.map((n) => [n.id, n]))
	const result = sortedNodeIds.map((id) => nodeMap.get(id)).filter((n): n is Node => n !== undefined)
	return result
}
