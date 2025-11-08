import { Control, FieldError, FieldErrors, FieldErrorsImpl, FieldValues, Merge, RegisterOptions, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { MultiValue, SingleValue } from 'react-select';
import { Maybe } from 'yup';

export interface Option {
    value: string;
    label: string;
}
export interface SelectInputProps {
    id: string;
    label: string;
    register?: UseFormRegister<any>;
    errors?: FieldErrors<FieldValues>;
    setValue: UseFormSetValue<any>;
    required?: boolean;
    options?: Option[];
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    validate?: (value: string) => true | string;
    value?: string;
    mode?: 'create' | 'edit';
}

export interface FileUploadProps {
    id: string;
    setValue: any;
    getValues?: any;
    trigger: any;
    control?: any;
    filePreview?: string | null;
    setFilePreview: any;
    error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
    accept?: string;
    maxSizeMB?: number;
    docPath?: string;
    preview?: boolean;
    required?: boolean;
    helperText?: string;
    initialValue?: string;
    index?: number;
    onPreviewClick?: () => void;
    name?: string;
}
export interface RadioGroupProps {
    id: string;
    label?: string;
    options: Option[];
    register: UseFormRegister<any>;
    errors: FieldErrors<FieldValues>;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    requiredMsg?: string;
    defaultValue?: string;
}
export interface TextInputProps {
    id: string;
    label: string;
    register?: UseFormRegister<any>;
    errors?: FieldErrors<FieldValues>;
    value?: string | Maybe<string>;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    mode?: "create" | "edit";
    readOnly?: boolean;
    required?: boolean;
    maxLength?: number;
    disabled?: boolean;
    validationRules?: RegisterOptions;
    setValue?: UseFormSetValue<any>;
    type?: string;
    validation?: RegisterOptions;
    isMobileField?: boolean;
    isEmailField?: boolean;
    pattern?: string;
    min?: string;
}

export interface NewDateInputProps {
    id: string;
    label: string;
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    errors: FieldErrors;
    required?: boolean;
}

export interface TextareaInputProps {
    id: string;
    label: string;
    register?: UseFormRegister<any>;
    errors?: FieldErrors;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    mode?: 'create' | 'edit';
    setValue?: UseFormSetValue<any>;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    maxLength?: number;
    rows?: number;
}

export interface Country {
    code: string;
    name: string;
    callingCode: string;
    flag: string;
    flag2x?: string;
}

export interface CountryDropdownProps {
  value: Country;
  onChange: (value: string | Country) => void;
  countries: Country[];
  disabled?: boolean;
}
export interface FileUploadInputsProps {
    id: string;
    label: string;
    filePreview?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    fileType?: any;
}

export interface DateInputProps {
    id?: string;
    label?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export interface CheckboxGroupProps {
    name: string;
    label: string;
    options: string[];
    control: Control<any>;
}

export interface ReactSelectInputProps {
    id?: string;
    label?: string;
    control?: Control<any>;
    value?: any;
    onChange?: (newValue: MultiValue<Option> | SingleValue<Option>) => void;
    options: Option[];
    isClearable?: boolean;
    isDisabled?: boolean;
    isMulti?: boolean;
    isLoading?: boolean;
    fromShowFilters?: boolean;
    placeholder?: string;
    required?: boolean;
    error?: FieldError;
}
export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onClick?: () => void;
    className?: string;
}
export interface PaginationProps {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}