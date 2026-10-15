/**
 * Pagination dùng chung.
 * - Khi có `total`: hiển thị các nút số trang, nút Sau disable khi hết trang.
 * - Khi không có `total`: fallback — nút Sau disable khi count < pageSize.
 * - `onPageChange(page)`: nhảy trực tiếp tới trang; nếu không truyền thì chỉ dùng onPrev/onNext.
 */
export default function Pagination({ page, pageSize, count, total, itemLabel = "bản ghi", loading, onPrev, onNext, onPageChange }) {
  if (loading || count === 0) return null;

  const totalPages = total != null && pageSize > 0 ? Math.ceil(total / pageSize) : null;
  const isLastPage = totalPages != null ? page >= totalPages : count < pageSize;

  const getPageItems = () => {
    if (!totalPages) return [];
    const range = new Set([1, totalPages]);
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      range.add(i);
    }
    const sorted = [...range].sort((a, b) => a - b);
    const items = [];
    sorted.forEach((p, idx) => {
      if (idx > 0 && p - sorted[idx - 1] > 1) items.push('...');
      items.push(p);
    });
    return items;
  };

  const pageItems = getPageItems();

  const handleGoTo = (p) => {
    if (onPageChange) onPageChange(p);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
      <span className="text-sm text-gray-500">
        {total != null
          ? <>Tổng cộng <strong>{total}</strong> {itemLabel}</>
          : <>Hiển thị {count} {itemLabel}</>
        }
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={onPrev}
          className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Trước
        </button>

        {pageItems.length > 0 ? (
          pageItems.map((item, idx) =>
            item === '...' ? (
              <span key={`e${idx}`} className="px-2 py-1 text-sm text-gray-400">...</span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => handleGoTo(item)}
                disabled={!onPageChange && item !== page}
                className={`px-3 py-1 text-sm rounded font-semibold border transition-colors ${
                  item === page
                    ? 'bg-blue-500 text-white border-blue-500 cursor-default'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {item}
              </button>
            )
          )
        ) : (
          <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded">{page}</span>
        )}

        <button
          type="button"
          disabled={isLastPage}
          onClick={onNext}
          className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
