import React, { useEffect } from 'react';
import { SelectInputProps } from '@/types/CustomInputTypes';

const SelectInput: React.FC<SelectInputProps> = ({ id, label, register, errors, setValue, required, options, onChange, validate, value, mode = 'create', disabled = false }) => {

    const error = errors?.[id]?.message as string | undefined;
    const fieldName = id && id.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

    useEffect(() => {
        if (register && mode === 'edit') {
            register(id, {
                validate: (val: string) => {
                    return validate ? validate(val) : (!!val || `${fieldName} is required`);
                },
            });

            if (value) {
                setValue?.(id, value, {
                    shouldValidate: true,
                    shouldDirty: false,
                });
            }
        }
    }, [register, setValue, id, value, validate, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value === 'unset' ? '' : e.target.value;

        setValue?.(id, selectedValue, {
            shouldValidate: true,
            shouldTouch: true,
        });

        onChange?.(e);
    };

    const selectProps =
        register
            ? {
                ...register(id, {
                    validate: (val: string) => {
                        return validate ? validate(val) : (!!val || `${fieldName} is required`);
                    },
                }),
                onChange: handleChange,
            }
            : {
                name: id,
                value: value ?? '',
                onChange: handleChange,
            };

    return (
        <div className="input-wrapper material-input-wrapper">
            <style>
                {`
                    .material-input-wrapper {
                        position: relative;
                        margin-bottom: 1.5rem;
                    }
                    .material-input-wrapper select {
                        width: 100%;
                        padding: 0.75rem 2.5rem 0.75rem 0.75rem; /* Adjusted padding for arrow space */
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        outline: none;
                        font-size: 1rem;
                        background-color: white;
                        cursor: pointer;
                        appearance: none; /* Remove default browser styling */
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23000' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-position: right 0.75rem center;
                        background-size: 12px 12px;
                        transition: border-color 0.2s ease-in-out;
                    }
                    .material-input-wrapper select:disabled {
                        cursor: not-allowed;
                        background-color: #f3f4f6;
                        opacity: 0.7;
                    }
                    .material-input-wrapper select:focus {
                        border: 2px solid #000;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23000' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
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
            <select id={id} aria-label={label} {...selectProps} disabled={disabled} className={`custom-input ${disabled ? 'cursor-not-allowed bg-gray-100' : ''}`}>
                <option value="" disabled hidden></option>
                {!disabled && <option value="unset">Unset</option>}
                {options?.map((opt) => (
                    <option key={opt?.value} value={opt?.value}>
                        {opt?.label}
                    </option>
                ))}
            </select>
            <span className="material-label">
                {label} {required && '*'}
            </span>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default SelectInput;

// INFO: Reference code for future
// TODO: Remove once all stable

// const SelectInput: React.FC<SelectInputProps> = ({
//     id,
//     label,
//     register,
//     errors,
//     setValue,
//     required,
//     options,
//     onChange,
//     validate,
//     value,
//     mode = 'create',
//     disabled = false,
//     status = 'complete',
//     loadingMessage,
//     failedMessage,
//     noOptionsMessage,
// }) => {
//     const error = errors?.[id]?.message as string | undefined;

//     useEffect(() => {
//         if (register && mode === 'edit') {
//             register(id, {
//                 validate: (val: string) => validate ? validate(val) : (!!val || 'This field is required'),
//             });

//             if (value) {
//                 setValue?.(id, value, {
//                     shouldValidate: true,
//                     shouldDirty: false,
//                 });
//             }
//         }
//     }, [register, setValue, id, value, validate, mode]);

//     const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const selectedValue = e.target.value === 'unset' ? '' : e.target.value;
//         setValue?.(id, selectedValue, {
//             shouldValidate: true,
//             shouldTouch: true,
//         });
//         onChange?.(e);
//     };

//     const selectProps = register
//         ? {
//             ...register(id, {
//                 validate: (val: string) => validate ? validate(val) : (!!val || 'This field is required'),
//             }),
//             onChange: handleChange,
//         }
//         : {
//             name: id,
//             value: value ?? '',
//             onChange: handleChange,
//         };

//     return (
//         <div className="input-wrapper">
//             <select
//                 id={id}
//                 aria-label={label}
//                 {...selectProps}
//                 disabled={disabled}
//                 className={`custom-input ${disabled ? 'cursor-not-allowed bg-gray-100' : ''}`}
//             >
//                 <option value="" disabled hidden></option>
//                 {!disabled && <option value="unset">Unset</option>}

//                 {status === 'pending' && <option disabled>{loadingMessage || 'Loading...'}</option>}
//                 {status === 'failed' && <option disabled>{failedMessage || 'Failed to load data'}</option>}
//                 {status === 'complete' && options?.length > 0 ? (
//                     options.map((opt: any) => (
//                         <option key={opt?.value} value={opt?.value}>
//                             {opt?.label}
//                         </option>
//                     ))
//                 ) : (
//                     status === 'complete' && <option disabled>{noOptionsMessage || 'No options available'}</option>
//                 )}
//             </select>

//             <span className="material-label">
//                 {label} {required && '*'}
//             </span>
//             {error && <p className="error-message">{error}</p>}
//         </div>
//     );
// };

// export default SelectInput;
