import { NewDateInputProps } from '@/types/CustomInputTypes';
import React, { useState } from 'react';

const DateInput: React.FC<NewDateInputProps> = ({
  id,
  label,
  register,
  setValue,
  errors,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errors[id];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    const parts = inputValue.split('-');
    if (parts.length === 3) {
      let [year, month, day] = parts;
      if (year.length > 4) year = year.slice(0, 4);
      inputValue = [year, month, day].join('-');
    }
    setValue(id, inputValue);
  };

  const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    const parts = pasted.split('-');
    if (parts.length === 3 && parts[0].length > 4) {
      e.preventDefault();
    }
  };

  return (
    <>
      <style>
        {`
          .material-input-wrapper {
            position: relative;
            margin-bottom: 1.5rem;
          }
          .material-input-wrapper input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            outline: none;
            font-size: 1rem;
            background: transparent;
            transition: border-color 0.2s ease-in-out;
          }
          .material-input-wrapper input:focus {
            border: 2px solid #000;
          }
          .material-input-wrapper input:not(:placeholder-shown) + .material-label,
          .material-input-wrapper input:focus + .material-label {
            top: -0.75rem;
            left: 0.75rem;
            font-size: 0.75rem;
            color: #000;
            background: #fff;
            padding: 0 0.25rem;
          }
          .material-label {
            position: absolute;
            top: 0.75rem;
            left: 0.75rem;
            font-size: 1rem;
            color: #999;
            pointer-events: none;
            transition: all 0.2s ease-in-out;
          }
          .material-input-wrapper .error-message {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }
        `}
      </style>

      <div className="material-input-wrapper">
        <input
          type="date"
          id={id}
          placeholder="dd-mm-yyyy"
          {...register(id, { required })}
          onChange={handleDateChange}
          onPaste={handleDatePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <label htmlFor={id} className="material-label">
          {label} {required && <span className="text-black">*</span>}
        </label>
        {hasError && (
          <p className="error-message">{errors[id]?.message as string}</p>
        )}
      </div>
    </>
  );
};

export default DateInput;