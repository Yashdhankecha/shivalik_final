import React from "react";
import Select from "react-select";
import { ReactSelectInputProps } from "../../types/CustomInputTypes";
import { customReactSelectStyles } from "../../utils/Constant/stylesConstant";
import { Controller } from "react-hook-form";

const ReactSelectInput: React.FC<ReactSelectInputProps> = ({
    id,
    label,
    value,
    onChange,
    options,
    isClearable = true,
    isDisabled = false,
    isMulti = false,
    placeholder = "Select option(s)",
    isLoading,
    fromShowFilters = true,
    error,
    control,
    required = false,
}) => {
    const showError = typeof error?.message === 'string';

    const selectComponent = (
        <Select
            inputId={id}
            value={value}
            onChange={onChange}
            options={options}
            isClearable={isClearable}
            isDisabled={isDisabled}
            isMulti={isMulti}
            placeholder={placeholder}
            isLoading={isLoading}
            styles={customReactSelectStyles}
            menuPortalTarget={document.body}
            isSearchable={false}
        />
    );

    return (
        <div className={fromShowFilters ? 'mb-4' : ''}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && " *"}
                </label>
            )}

            {control && id ? (
                <Controller
                    name={id}
                    control={control}
                    rules={required ? { required: `${label} is required` } : {}}
                    render={({ field }) => (
                        <Select
                            {...field}
                            inputId={id}
                            isSearchable={false}
                            value={value}
                            options={options}
                            isClearable={isClearable}
                            isDisabled={isDisabled}
                            isMulti={isMulti}
                            placeholder={placeholder}
                            isLoading={isLoading}
                            styles={customReactSelectStyles}
                            menuPortalTarget={document.body}
                            onChange={(val) => {
                                field.onChange(val);
                                onChange?.(val);
                            }}
                        />
                    )}
                />
            ) : (
                selectComponent
            )}

            {showError && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
    );
};

export default ReactSelectInput;