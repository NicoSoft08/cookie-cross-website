import '../../styles/ui/Logo.scss';

export default function Logo({ src, alt = 'Logo', size = 'md', className, onclick }) {
    const sizeClasses = {
        sm: 'logo--sm',
        md: 'logo--md',
        lg: 'logo--lg',
        xl: 'logo--xl',
    };

    return (
        <div className={`logo ${sizeClasses[size]} ${className}`} onClick={onclick}>
            <img
                src={src}
                alt={alt}
                className="logo__image"
                onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );
};
