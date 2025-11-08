import React from "react";
import { useController } from "react-hook-form";
import { CheckboxGroupProps } from "../../types/CustomInputTypes";

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  name,
  label,
  options,
  control,
}) => {
  const {
    field: { value = [], onChange },
  } = useController({ name, control });

  const handleCheckboxChange = (checkedValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, checkedValue]);
    } else {
      onChange(value.filter((v: string) => v !== checkedValue));
    }
  };

  return (
    <div className="block space-y-4">
      <label className="block text-black sm:text-base text-sm mb-2 font-medium">
        {label}
      </label>
      <div className="inline-flex gap-3 flex-wrap">
        {options.map((option) => {
          const isChecked = value.includes(option);
          return (
            <div key={option} className="inline-flex items-center mt-2">
              <input
                type="checkbox"
                id={option}
                value={option}
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                className="peer hidden"
              />
              <label
                htmlFor={option}
                className="flex items-center justify-center w-5 h-5 border border-black rounded-sm cursor-pointer peer-checked:bg-black peer-checked:border-black"
              >
                <span className="text-white text-xs">
                  {isChecked ? "✔" : ""}
                </span>
              </label>
              <label
                htmlFor={option}
                className="cursor-pointer ml-2 text-black sm:text-base text-sm font-normal"
              >
                {option}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckboxGroup;
