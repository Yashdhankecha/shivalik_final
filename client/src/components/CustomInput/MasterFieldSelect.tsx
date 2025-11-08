import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { getMasterFieldsRequest } from "@/store/slices/territorySlice";
import { UseFormWatch } from "react-hook-form";

interface OptionType {
    value: string;
    label: string;
}

interface MasterFieldSelectProps {
    id: string;
    label: string;
    masterType: "Category" | "Unit Type" | "Sub Unit Type";
    setValue: any;
    errors: any;
    required?: boolean;
    mode?: "edit" | "create";
    defaultValue?: string; // for edit
    watch: UseFormWatch<any>;             // <-- use watch from react-hook-form
}

const MasterFieldSelect: React.FC<MasterFieldSelectProps> = ({
    id,
    label,
    masterType,
    setValue,
    errors,
    required,
    defaultValue,
    watch,
}) => {
    const dispatch = useDispatch();
    const { getMasterFieldsData, hasMoreMap, pageMap } = useSelector(
        (state: any) => state.territory
    );

    const [page, setPage] = useState(1);

    // Load next page
    useEffect(() => {
        if (page > 1) {
            dispatch(getMasterFieldsRequest({ masterType, page }));
        }
    }, [dispatch, masterType, page]);

    const data = getMasterFieldsData?.[masterType] || [];
    const options: OptionType[] = data.map((item: any) => ({
        value: item._id,
        label: item.title,
    }));

    // Controlled value: get current field from react-hook-form


    const currentValue = watch ? watch(id) : defaultValue || null;
    const selectedOption = options.find((opt) => opt.value === currentValue) || null;


    return (
        <div className="material-input-wrapper">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <Select
                inputId={id}
                options={options}
                value={selectedOption}
                onChange={(selected: any) => setValue(id, selected?.value)}
                onMenuScrollToBottom={() => {
                    if (hasMoreMap?.[masterType]) {
                        setPage((prev) => (pageMap?.[masterType] || prev) + 1);
                    }
                }}
            />
            {errors[id] && (
                <p className="mt-1 text-xs text-red-500">{errors[id].message}</p>
            )}
        </div>
    );
};

export default MasterFieldSelect;
