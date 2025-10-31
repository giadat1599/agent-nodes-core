export type SuccessResponse<T = void> = {
	success: true
	data: T
}

export type PaginatedResponse<T> = {
	success: true
	data: T[]
	pagination: {
		totalCount: number
		totalPages: number
		currentPage: number
		pageSize: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}

export type ErrorResponse = {
	success: false
	errors: string[]
}
