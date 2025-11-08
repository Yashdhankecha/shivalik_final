import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

const PAGE_LIMIT = 12;

interface PaginatedSelectProps {
  id: string;
  value: string | string[] | null;
  defaultLabel?: string | string[];
  onChange: (e: { target: { id: string; value: any } }) => void;
  placeholder?: string;
  sharedData?: any; // Data from Redux (e.g., getDesignationData, getBranchData)
  localData?: any[]; // Static data (e.g., employeeTypes, territories)
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isMulti?: boolean;
  count?: number;
  onOpen?: any;
  required?: boolean;
  error?: string;
  label?: string;
  clearErrors?: (name?: string) => void;
  onSearchInputChange?: (inputValue: string) => void;
  isBatch?: boolean;
  isDisabled?: boolean;
}

const PaginatedSelect: React.FC<PaginatedSelectProps> = ({
  id,
  value,
  defaultLabel,
  onChange,
  placeholder,
  sharedData,
  localData,
  currentPage,
  setCurrentPage,
  isMulti = false,
  count = 0,
  onOpen,
  required = false,
  error,
  label,
  clearErrors,
  onSearchInputChange,
  isBatch = false,
  isDisabled = false
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  const totalCount = sharedData?.result?.total || count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_LIMIT);

  const initialSelectedRef = React.useRef<string[] | null>(null);
  const clearedByUserRef = React.useRef(false);

  useEffect(() => {
    // store initial value(s) at mount for later removal on user-clear
    if (initialSelectedRef.current === null) {
      if (isMulti && Array.isArray(value)) initialSelectedRef.current = value.slice();
      else if (!isMulti && value) initialSelectedRef.current = [value];
      else initialSelectedRef.current = [];
    }
  }, []);

  useEffect(() => {
    let newOptions: any[] = [];

    if (sharedData?.result) {
      // Handle Redux data
      const dataKey = Object.keys(sharedData.result)?.find(
        (key) => Array.isArray(sharedData?.result[key]) && key !== 'total'
      );
      if (dataKey) {
        newOptions = sharedData?.result[dataKey]?.map((item: any) => ({
          value: id === "reportingPerson" ? item?._id : item?.employeeId || item?._id,
          label:
            item?.name ||
            item?.title ||
            `${item?.firstName || ""} ${item?.lastName || ""}`.trim() ||
            item?.batchName,
        }));
      }
    } else if (Array.isArray(localData)) {
      // Handle static local data
      newOptions = localData?.map((item) => ({
        value: item?.value,
        label: item?.label,
      }));
    }

    // Only update options if new data actually adds something new
    setOptions((prev) => {
      const merged = [...prev, ...newOptions];
      const unique = merged?.filter(
        (item, index, self) =>
          index === self?.findIndex((t) => t?.value === item?.value)
      );
      return unique;
    });

    // handle multi-select prefill
    if (isMulti && Array.isArray(value)) {
      // if user cleared explicitly, do not re-apply initial prefills
      if (!clearedByUserRef.current) {
        const matched = value?.map((val, idx) => {
          const found =
            newOptions?.find((opt) => opt?.value === val) ||
            options?.find((opt) => opt?.value === val);
          if (found) return found;

          if (Array.isArray(defaultLabel)) {
            const label = defaultLabel[idx] || String(val);
            return { value: val, label };
          }
          return { value: val, label: String(val) };
        });
        // Only set if we do not already have a selection
        setSelectedOption((prev) => (prev?.length > 0 ? prev : matched));
      }
    }

    // handle single-select prefill
    else if (!isMulti && value) {
      if (!clearedByUserRef.current) {
        const matchInNew = newOptions?.find((opt) => opt?.value === value);
        if (matchInNew) {
          setSelectedOption((prev) => (prev?.value ? prev : matchInNew));
        } else if (value && defaultLabel) {
          const fallbackOption = { value, label: String(defaultLabel) };
          setSelectedOption((prev) => (prev?.value ? prev : fallbackOption));
          setOptions((prev) => {
            const exists = prev?.find((opt) => opt?.value === fallbackOption?.value);
            return exists ? prev : [fallbackOption, ...prev];
          });
        }
      }
    }

  }, [sharedData, localData, currentPage]);

  useEffect(() => {
    if (isMulti) {
      if (Array.isArray(value) && value.length === 0) {
        setSelectedOption([]); // clear local state when cleared
      }
    } else {
      if (!value) {
        setSelectedOption(null);
      }
    }
  }, [value, isMulti]);

  const MenuList = (props: any) => (
    <components.MenuList {...props}>
      {props.children}
      {currentPage < totalPages && sharedData && (
        <div style={{ textAlign: 'center', padding: '10px', fontSize: 14 }}>
          Loading more...
        </div>
      )}
    </components.MenuList>
  );

  const handleMenuScrollToBottom = () => {
    if (currentPage < totalPages && sharedData) {
      setCurrentPage(currentPage + 1);
    }
  };


  return (
    <div>
      {label && (
        <label className="block text-gray-900 mb-2">
          {label} {required && " *"}
        </label>
      )}

      <Select
        inputId={id}
        components={{ MenuList }}
        options={options}
        value={selectedOption}
        isDisabled={isDisabled}

        onChange={(selected) => {
          if (isMulti) {
            const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];
            setSelectedOption(selectedArray);

            // user cleared (clicked the X or removed all)
            if (selectedArray.length === 0) {
              clearedByUserRef.current = true;
              // remove initial prefilled values from option list so they won't reappear
              const toRemove = initialSelectedRef.current || [];
              if (toRemove?.length > 0) {
                setOptions((prev) => prev.filter((opt) => !toRemove.includes(opt.value)));
              }
            } else {
              // user selected something -> reset cleared flag
              clearedByUserRef.current = false;
            }
            onChange({ target: { id, value: isBatch ? selectedArray : selectedArray.map((opt: any) => opt?.value) } });
          } else {
            const sel = selected;
            setSelectedOption(sel);
            if (!sel) {
              clearedByUserRef.current = true;
            } else {
              clearedByUserRef.current = false;
            }
            onChange({ target: { id, value: sel?.value || '' } });
          }
          clearErrors?.(id);
        }}
        placeholder={placeholder}
        isMulti={isMulti}
        isClearable
        onInputChange={(inputValue, { action }) => {
          // Prevent resetting options when clearing input or closing menu
          if (action === 'input-change') {
            onSearchInputChange?.(inputValue);
          }
        }}
        onMenuOpen={onOpen}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error?.message || error}</p>}
    </div>
  );
};

export default PaginatedSelect;