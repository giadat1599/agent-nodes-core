export type SuccessResponse<T = void> = {
	success: true
	data: T
}

export type ErrorResponse = {
	success: false
	errors: string[]
}
