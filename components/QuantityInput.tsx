'use client';

import { useState, useEffect } from 'react';

interface QuantityInputProps {
    value: number;
    onUpdate: (value: number) => void;
}

export default function QuantityInput({ value, onUpdate }: QuantityInputProps) {
    const [localValue, setLocalValue] = useState<string>(value.toString());

    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur = () => {
        const num = parseInt(localValue);
        if (!isNaN(num) && num > 0) {
            onUpdate(num);
            setLocalValue(num.toString());
        } else {
            setLocalValue(value.toString()); // Reset to prop value if invalid
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onUpdate(Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                type="button"
            >
                -
            </button>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="h-8 w-14 rounded border border-gray-300 text-center text-sm focus:border-navy-500 focus:outline-none"
            />
            <button
                onClick={() => onUpdate(value + 1)}
                className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
                type="button"
            >
                +
            </button>
        </div>
    );
}
