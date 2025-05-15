export type AccountRoles = 'user' | 'admin' | 'staff'

export type Pagination<Filter extends string = unknown> = {
	page: number;
	limit: number;
	offset: number;
	sort: "asc" | "desc";
	sortBy?: string;
	filter?: Filter;
	search?: string;
};

export type PaginationResponse<T> = {
	limit: number;
	page: number;
	totalCount: number;
	totalPages: number;
	data: T[];
};