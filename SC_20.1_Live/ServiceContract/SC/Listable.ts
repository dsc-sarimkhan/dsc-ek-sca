export interface Listable<T> {
    filter: string;
    order: number;
    sort: keyof T;
    from: string;
    to: string;
    page: number;
    results_per_page?: number;
}
