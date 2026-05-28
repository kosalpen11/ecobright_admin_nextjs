const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function getPagination(
  pageParam: string | undefined,
  pageSizeParam?: string | undefined
) {
  const page = parsePositiveInt(pageParam, DEFAULT_PAGE);
  const pageSize = Math.min(
    parsePositiveInt(pageSizeParam, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize
  };
}

export function getTotalPages(totalItems: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
