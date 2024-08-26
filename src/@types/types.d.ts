export type AccountRoles = 'user' | 'admin' | 'staff'

export type Pagination<Filter extends string = unknown> = {
	page: number;
	limit: number;
	offset: number;
	search: string;
	filter?: Filter;
};