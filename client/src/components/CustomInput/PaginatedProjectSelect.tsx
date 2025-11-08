import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

const PAGE_LIMIT = 12;

interface PaginatedSelectProps {
  id: string;
  value: string | string[] | null;
  defaultLabel?: string;
  onChange: (e: { target: { id: string; value: any } }) => void;
  placeholder?: string;
  sharedProjectData?: any;
  sharedCategoryData?: any;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isMulti?: boolean;
  count?: number;
  isDisabled?: boolean;
}

const PaginatedProjectSelect : React.FC<PaginatedSelectProps> = ({
  id,
  value,
  defaultLabel,
  onChange,
  placeholder,
  sharedProjectData,
  currentPage,
  setCurrentPage,
  sharedCategoryData,
  isMulti,
  count = 0,
  isDisabled = false
}) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const totalCount = sharedProjectData?.result?.total || count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_LIMIT);

useEffect(() => {
  let newOptions = [];

    if (sharedProjectData?.result?.projects) {
      newOptions = sharedProjectData.result.projects.map((p) => ({
        value: p?._id,
        label: p?.name || p?.unitNumber,
      }));
    } else if (Array.isArray(sharedCategoryData)) {
      newOptions = sharedCategoryData.map(item => ({
        value: item?._id,
        label: item?.name || item?.title || item?.unitNumber,
      }));
    }

  if (currentPage === 1) {
    setOptions(newOptions);
  } else {
    setOptions((prevOptions) => {
      const merged = [...prevOptions, ...newOptions];
      const unique = merged.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.value === item.value)
      );
      return unique;
    });
  }

    const matchInNew = newOptions.find((opt) => opt.value === value);
    const matchInPrev = options.find((opt) => opt.value === value);
    if (matchInNew || matchInPrev) {
      setSelectedOption(matchInNew || matchInPrev);
    } else if (value && defaultLabel) {
      const fallbackOption = { value, label: defaultLabel };
      setSelectedOption(fallbackOption);
      setOptions((prev) => {
      const exists = prev.find(opt => opt.value === fallbackOption.value);
      return exists ? prev : [fallbackOption, ...prev];
    });
    }
  }, [sharedProjectData, sharedCategoryData, currentPage]);

  const MenuList = (props) => (
    <components.MenuList {...props}>
      {props.children}
      {currentPage < totalPages && (
        <div style={{ textAlign: 'center', padding: '10px', fontSize: 14 }}>
          Loading more...
        </div>
      )}
    </components.MenuList>
  );

  const handleMenuScrollToBottom = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    if ((isMulti && Array.isArray(value) && value.length === 0) || (!isMulti && !value)) {
      setSelectedOption(isMulti ? [] : null);
    }
  }, [value, isMulti]);

  return (
    <Select
      inputId={id}
      components={{ MenuList }}
      options={options}
      value={selectedOption}
      onChange={(selected) => {
        if (isMulti) {
          const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];
          setSelectedOption(selectedArray);
          onChange({ target: { id, value: selectedArray } });
        } else {
          setSelectedOption(selected);
          onChange({
            target: {
              id,
              value: selected?.value || '',
            },
          });
        }
      }}
      placeholder={placeholder}
      isMulti={!!isMulti}
      isClearable
      isDisabled={isDisabled}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={{
        menuPortal: base => ({ ...base, zIndex: 9999 }),
      }}
    />
  );
};

export default PaginatedProjectSelect;
