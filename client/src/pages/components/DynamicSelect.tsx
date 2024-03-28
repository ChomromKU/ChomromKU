import { useCallback } from "react";

interface Props<Datatype> {
    label?: string
    placeholder?: string
    items: Array<Datatype>
    value: string
    labelExtractor: (item:Datatype) => string
    valueExtractor: (item:Datatype) => string
    onValueChange?: (value:string, selectedItem:Datatype) => void
    className?: string;
}

const DynamicSelect = <DataType,> ({
    label,
    placeholder,
    items,
    value,
    onValueChange,
    labelExtractor,
    valueExtractor,
    className
}: Props<DataType>) => {
    const handleOnValueChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const {
                target: {value: selectedValue}
            } = event

            const item = items.find((i) => valueExtractor(i) === selectedValue)

            if(!item) return;

            onValueChange?.(selectedValue, item!)
        },
        [items]
    )

    return (
        <label className="flex w-full flex-col items-stretch space-y-2">
            {label && <span>{label}</span>}
            <select
                value={value}
                onChange={handleOnValueChange}
                className={className ? className : "dropdown w-full max-w-md rounded-md border border-gray-100 px-4 py-2"}
            >
                <option value="" disabled hidden>
                    {placeholder}
                </option>
                {items.map((item, index)=>{
                    const itemLabel = labelExtractor(item)
                    const itemValue = valueExtractor(item)
                    return (
                        <option key={index} value={itemValue} className="capitalize">
                            {itemLabel}
                        </option>
                    )
                })}
            </select>
        </label>
    )
}

DynamicSelect.displayName = 'DynamicSelect'

export {DynamicSelect}