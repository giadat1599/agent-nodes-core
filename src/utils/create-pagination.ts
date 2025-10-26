export function createPagination(page: number, pageSize: number) {
	return {
		limit: pageSize,
		offset: (page - 1) * pageSize,
	}
}
