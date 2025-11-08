import React, { useEffect, useState } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { TextareaInputProps } from '../../types/CustomInputTypes';

const TextareaInput: React.FC<TextareaInputProps> = ({
  id,
  label,
  register,
  errors,
  value,
  onChange,
  setValue,
  required,
  readOnly,
  disabled,
  maxLength,
  rows = 4,
}) => {
  const error = errors?.[id]?.message as string | undefined;
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || (!!value && value.length > 0);

  const validationRules: RegisterOptions = {
    ...(required ? { required: `${label} is required` } : {}),
  };

  useEffect(() => {
    if (register) {
      register(id, validationRules);
    }

    if (value !== undefined) {
      setValue?.(id, value, { shouldValidate: true });
    }
  }, [register, setValue, id, value, required]);

  return (
    <div className={`input-wrapper ${isActive ? 'active' : ''}`}>
      <style>
        {`
                        .material-input-wrapper {
                          position: relative;
                          margin-bottom: 1.5rem;
                        }
            
                        .material-input-wrapper textarea {
                          width: 100%;
                          padding: 0.75rem;
                          border: 1px solid #ccc;
                          border-radius: 4px;
                          outline: none;
                          font-size: 1rem;
                          transition: border-color 0.2s ease-in-out;
                        }
            
                        .material-input-wrapper textarea {
                          min-height: 120px;
                          resize: vertical;
                        }
            
                        .material-input-wrapper textarea:focus {
                          border: 2px solid #000;
                        }
            
                        .material-input-wrapper textarea:not(:placeholder-shown) + .material-label,
                        .material-input-wrapper textarea:focus + .material-label {
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
      <textarea
        id={id}
        aria-label={label}
        placeholder=""
        readOnly={readOnly}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        style={{ height: 100 }}
        className={`custom-input !resize-y !min-h-[2.5rem] ${disabled ? 'cursor-not-allowed bg-gray-100' : ''}`}
        // INFO: Managed Controlled and UnControlled together
        {...(onChange
          ? {
            value: value ?? '',
            onChange: (e) => {
              onChange(e);
              setValue?.(id, e.target.value, { shouldValidate: true, shouldTouch: true });
            },
          }
          : register && register(id, validationRules))}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <span className="material-label">
        {label} {required && '*'}
      </span>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default TextareaInput;