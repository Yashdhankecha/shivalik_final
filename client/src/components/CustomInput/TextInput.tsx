import React, { useEffect, useState } from "react";
import { TextInputProps } from "../../types/CustomInputTypes";
import { RegisterOptions } from "react-hook-form";
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import metadata from 'libphonenumber-js/metadata.min.json';

const fallbackCountry = {
  code: 'IN',
  callingCode: '+91',
  name: 'India',
};

const TextInput: React.FC<TextInputProps> = ({
    id,
    label,
    register,
    errors,
    value,
    onChange,
    mode = "create",
    setValue,
    readOnly,
    required,
    maxLength,
    type = "text",
    disabled = false,
    validation = {},
    isMobileField,
    isEmailField,
    min,
    country,
}) => {
    const error = errors?.[id]?.message as string | undefined;
    const [isFocused, setIsFocused] = useState(false);
    const isActive = isFocused || (!!value && value.length > 0);

    const validationRules: RegisterOptions = {
        ...(required ? { required: `${label} is required` } : {}),
       validate: (value) => {
        
            if (typeof value === 'string' && isMobileField) {
                let callingCode = '';

                if (typeof country === 'string') {
                    callingCode = country.replace(/\D/g, '');
                } else if (typeof country === 'object' && country?.callingCode) {
                    callingCode = country.callingCode.replace(/\D/g, '');
                } else {
                    callingCode = fallbackCountry.callingCode.replace(/\D/g, '');
                }

                if (!callingCode) {
                    return `Missing country calling code for ${label}`;
                }

                const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');

                const fullNumber = `+${callingCode}${cleanedValue}`

                try {
                    const phoneNumber = parsePhoneNumberFromString(fullNumber);
                    if (!phoneNumber || !phoneNumber.isValid()) {
                        return `Invalid ${label.toLowerCase()}`;
                    }
                    const type = phoneNumber.getType();
                    if (type !== 'MOBILE' && type !== 'FIXED_LINE_OR_MOBILE') {
                        return `Invalid ${label.toLowerCase()}`;
                    }
                } catch (e) {
                    console.error('Phone number parsing error:', e);
                    return `Invalid ${label.toLowerCase()}`;
                 }
                } else if (isEmailField) {
                    if (value.trim() === "") {
                        return `${label} cannot be only whitespace`;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const hasConsecutiveDots = value.includes('..');

                    if (!emailRegex.test(value.trim()) || hasConsecutiveDots) {
                        return 'Must be a valid email address';
                    }

            }
            return true;
        }
    };

    useEffect(() => {
        if (mode === 'create' && register) {
            register(id as string, validationRules);
        }

        if (mode === 'edit' && setValue && register) {
            setValue(id as any, value ?? '', { shouldValidate: true });
            register(id as string, validationRules);
        }
    }, [register, setValue, id, value, required, mode]);



    return (
        <>
            <style>
                {`
                    .material-input-wrapper {
                      position: relative;
                    }                    
                    .material-input-wrapper input,
                    .material-input-wrapper select,
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
                    .material-input-wrapper input:focus,
                    .material-input-wrapper select:focus,
                    .material-input-wrapper textarea:focus {
                      border: 2px solid #000;
                    }                    
                    .material-input-wrapper input:not(:placeholder-shown) + .material-label,
                    .material-input-wrapper select:not(:placeholder-shown) + .material-label,
                    .material-input-wrapper textarea:not(:placeholder-shown) + .material-label,
                    .material-input-wrapper input:focus + .material-label,
                    .material-input-wrapper select:focus + .material-label,
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
            <div className={`input-wrapper ${isActive ? "active" : ""}`}>
                <input
                    type={type}
                    id={id}
                    aria-label={label}
                    placeholder=""
                    disabled={disabled}
                    readOnly={readOnly}
                    min={min}
                    maxLength={maxLength}
                    className={`custom-input ${disabled ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    {...(mode === "create"
                        ? register?.(id, validationRules)
                        : {
                            name: id,
                            value: value ?? "",
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                const newVal = e.target.value;
                                onChange?.(e);
                                setValue?.(id, newVal, { shouldValidate: true });
                            },
                        })}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)} />

                <span className="material-label">
                    {label} {required && "*"}
                </span>
                {error && <p className="error-message">{error}</p>}
            </div>
        </>
    );
};

export default TextInput;
