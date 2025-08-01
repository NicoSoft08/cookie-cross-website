export default function Button({ children,
    className = '',
    variant = 'primary',
    size = 'md',
    disabled,
    isLoading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    ref,
    ...props
}) {
    const variantClass = `button--${variant}`;
    const sizeClass = `button--${size}`;
    const fullWidthClass = fullWidth ? 'button--full' : '';

    return (
        <button
            className={`button ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`}
            disabled={disabled || isLoading}
            ref={ref}
            {...props}
        >
            {isLoading && (
                <span className="button__spinner">
                    <svg
                        className="button__spinner-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </span>
            )}
            {icon && iconPosition === 'left' && !isLoading && (
                <span className="button__icon button__icon--left">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && !isLoading && (
                <span className="button__icon button__icon--right">{icon}</span>
            )}
        </button>
    );
};
