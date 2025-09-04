// components/ui/Pagination.tsx - Reusable pagination component
import React from 'react';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    showInfo?: boolean;
    maxVisiblePages?: number;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    isLoading = false,
    showInfo = true,
    maxVisiblePages = 5,
    className = ''
}) => {
    // Don't render if there's only one page or no items
    if (totalPages <= 1 || totalItems === 0) return null;

    // Calculate start and end item numbers for display
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Calculate visible page numbers
    const getVisiblePages = (): number[] => {
        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - half);
        const end = Math.min(totalPages, start + maxVisiblePages - 1);

        // Adjust start if we're near the end
        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();
    const showFirstEllipsis = visiblePages[0] > 2;
    const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

    const handlePageClick = (page: number) => {
        if (page === currentPage || isLoading) return;
        onPageChange(page);
    };

    const handlePrevious = () => {
        if (currentPage > 1 && !isLoading) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && !isLoading) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <nav 
            className={`pagination ${className} ${isLoading ? 'pagination--loading' : ''}`}
            aria-label="Pagination navigation"
            role="navigation"
        >
            {showInfo && (
                <div className="pagination__info">
                    <span className="pagination__text">
                        Showing {startItem}-{endItem} of {totalItems} projects
                    </span>
                </div>
            )}

            <div className="pagination__controls">
                {/* Previous Button */}
                <button
                    className={`pagination__button pagination__button--prev ${currentPage === 1 ? 'pagination__button--disabled' : ''}`}
                    onClick={handlePrevious}
                    disabled={currentPage === 1 || isLoading}
                    aria-label="Go to previous page"
                >
                    <span className="pagination__arrow">‹</span>
                    <span className="pagination__label">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="pagination__pages">
                    {/* First page if not visible */}
                    {visiblePages[0] > 1 && (
                        <>
                            <button
                                className="pagination__number"
                                onClick={() => handlePageClick(1)}
                                disabled={isLoading}
                                aria-label="Go to page 1"
                            >
                                1
                            </button>
                            {showFirstEllipsis && (
                                <span className="pagination__ellipsis" aria-hidden="true">
                                    …
                                </span>
                            )}
                        </>
                    )}

                    {/* Visible page numbers */}
                    {visiblePages.map(page => (
                        <button
                            key={page}
                            className={`pagination__number ${page === currentPage ? 'pagination__number--current' : ''}`}
                            onClick={() => handlePageClick(page)}
                            disabled={isLoading}
                            aria-label={page === currentPage ? `Current page, page ${page}` : `Go to page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    ))}

                    {/* Last page if not visible */}
                    {visiblePages[visiblePages.length - 1] < totalPages && (
                        <>
                            {showLastEllipsis && (
                                <span className="pagination__ellipsis" aria-hidden="true">
                                    …
                                </span>
                            )}
                            <button
                                className="pagination__number"
                                onClick={() => handlePageClick(totalPages)}
                                disabled={isLoading}
                                aria-label={`Go to page ${totalPages}`}
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                {/* Next Button */}
                <button
                    className={`pagination__button pagination__button--next ${currentPage === totalPages ? 'pagination__button--disabled' : ''}`}
                    onClick={handleNext}
                    disabled={currentPage === totalPages || isLoading}
                    aria-label="Go to next page"
                >
                    <span className="pagination__label">Next</span>
                    <span className="pagination__arrow">›</span>
                </button>
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="pagination__loading">
                    <div className="pagination__spinner" aria-hidden="true"></div>
                    <span className="pagination__loading-text">Loading...</span>
                </div>
            )}
        </nav>
    );
};

export default Pagination;