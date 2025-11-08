import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { PaginationProps } from '../../types/CustomInputTypes';

const Pagination: React.FC<PaginationProps> = ({
    totalItems,
    pageSize,
    currentPage,
    onPageChange
}) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const [inputPage, setInputPage] = useState(currentPage);

    useEffect(() => {
        setInputPage(currentPage);
    }, [currentPage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setInputPage(Number(value));
        }
    };

    const handleGoToPage = () => {
        const num = Number(inputPage);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
            onPageChange(num);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="mt-4 p-4 flex-shrink-0 flex justify-between items-center">
            <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
                <button
                    className={`px-2 py-1 rounded ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <Icon icon="mdi:keyboard-arrow-left" width="14" height="14" />
                </button>

                <button
                    className={`${currentPage === 1 ? 'text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-100'}`}
                    onClick={() => onPageChange(1)}
                >
                    1
                </button>

                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    className="w-12 border rounded px-1 py-0.5 text-center text-sm"
                    value={inputPage}
                    onChange={handleInputChange}
                    onBlur={handleGoToPage}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleGoToPage();
                    }}
                />

                <button
                    className={`${currentPage === totalPages ? 'text-gray-500 cursor-not-allowed' : ''}`}
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </button>

                <button
                    className={`px-2 py-1 rounded ${currentPage === totalPages
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <Icon icon="mdi:keyboard-arrow-right" width="14" height="14" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
