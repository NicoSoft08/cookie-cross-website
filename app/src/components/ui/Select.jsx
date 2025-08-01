import { ChevronDown } from 'lucide-react';

export default function Select({ label, error, helperText, fullWidth = false, options, onChange, className = '', ...props }, ref) {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500' : '';

    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div className={`select ${widthClass} ${className}`}>
            {label && (
                <label htmlFor={props.id} className="label">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    className={`select-field ${errorClass} ${widthClass}`}
                    onChange={handleChange}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute">
                    <ChevronDown size={16} className="text-gray-400" />
                </div>
            </div>
            {error && <p className="error-text">{error}</p>}
            {helperText && <p className="helper-text">{helperText}</p>}
        </div>
    )
}
