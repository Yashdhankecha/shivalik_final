import React from 'react';
import IconSearch from '../Icon/IconSearch';
import { SearchInputProps } from '../../types/CustomInputTypes';

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Search...',
    onClick,
    className = '',
}) => {
    return (
        <div
            className={`relative mb-2 w-full ${className}`}
            onClick={onClick}
        >
            <input
                type="text"
                placeholder={placeholder}
                className="p-1 pl-10 pr-4 bg-[#f1f1f1] border-none ml-1 text-[#000033] w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ paddingLeft: '2.5rem !important' }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <IconSearch className="w-4 h-4 text-gray-500" />
            </div>
        </div>
    );
};

export default SearchInput;