import React from "react";
import Select from "react-select";
import { Controller } from "react-hook-form";

const ReactSelectInput2 = ({
  id,
  label,
  options,
  isClearable = true,
  isDisabled = false,
  isMulti = false,
  placeholder = "Select option(s)",
  isLoading = false,
  error,
  control,
  required = false,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && "*"}
        </label>
      )}

      <Controller
        name={id}
        control={control}
        rules={required ? { required: `${label} is required` } : {}}
        render={({ field }) => (
          <Select
            inputId={id}
            {...field}
            value={field.value}
            options={options}
            isClearable={isClearable}
            isDisabled={isDisabled}
            isMulti={isMulti}
            placeholder={placeholder}
            isLoading={isLoading}
            styles={{
              control: (base) => ({
                ...base,
              }),
            }}
            onChange={(val) => {
              field.onChange(val);
            }}
          />
        )}
      />

      {error?.message && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default ReactSelectInput2;
