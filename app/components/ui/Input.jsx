import '../../styles/ui/Input.scss';

export default function Input({ label, error, helperText, fullWidth = false, icon, className = '', ...props }, ref) {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500' : '';

    return (
        <div className={`input ${widthClass} ${className}`}>
            {label && (
                <label htmlFor={props.id} className="label">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute">
                        {icon}
                    </div>
                )}
                <input 
                    ref={ref}
                    className={`input-field ${errorClass} ${icon ? 'pl-10' : ''} ${widthClass}`}
                    {...props}
                />
            </div>
            {error && <p className="error-text">{error}</p>}
            {helperText && <p className="helper-text">{helperText}</p>}
        </div>
    );
};
