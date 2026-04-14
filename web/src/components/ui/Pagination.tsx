type PaginationProps = {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export default function Pagination({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}: PaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="muted text-sm">
        Pagina {pageCount === 0 ? 0 : pageIndex + 1} de {pageCount}
      </p>
      <div className="flex gap-2">
        <button className="btn-ghost" onClick={onPreviousPage} disabled={!canPreviousPage}>
          Anterior
        </button>
        <button className="btn-ghost" onClick={onNextPage} disabled={!canNextPage}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
