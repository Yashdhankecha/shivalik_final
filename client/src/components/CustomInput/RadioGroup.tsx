import React from 'react';
import { RadioGroupProps } from '../../types/CustomInputTypes';

const RadioGroup: React.FC<RadioGroupProps> = ({
    id,
    label,
    options,
    register,
    errors,
    requiredMsg,
    onChange,
    defaultValue,
}) => {
    const error = errors[id]?.message as string | undefined;

    return (
        <div className="mb-4">
            {label && (
                <label className="block font-bold text-gray-700 mb-2" htmlFor={id}>
                    {label}
                </label>
            )}

            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0" id={id}>
                {options.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id={id}
                            value={option.value}
                            {...register(id, {
                                required: requiredMsg,
                            })}
                            defaultChecked={defaultValue === option.value}
                            onChange={(e) => {
                                register(id).onChange(e);
                                onChange?.(e);
                            }}
                        />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default RadioGroup;