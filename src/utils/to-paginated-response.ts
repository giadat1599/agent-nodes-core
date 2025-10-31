import type { Context } from "hono"
import type { AppContext } from "../context"
import type { PaginatedResponse } from "../types/response"

export function toPaginatedResponse<T>(
	data: T[],
	currentPagination: {
		totalCount: number
		pageSize: number
		page: number
	},
	c: Context<AppContext>,
) {
	const { totalCount, pageSize, page } = currentPagination
	const totalPages = Math.ceil(totalCount / pageSize)
	return c.json<PaginatedResponse<T>>({
		success: true,
		pagination: {
			totalCount,
			totalPages,
			pageSize,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			currentPage: page,
		},
		data,
	})
}
