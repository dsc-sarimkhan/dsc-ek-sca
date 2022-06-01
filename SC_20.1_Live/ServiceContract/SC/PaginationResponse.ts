export interface PaginationResponse<T> {
    page: string;
    records: T[];
    recordsPerPage: number;
    totalRecordsFound: number;
}
