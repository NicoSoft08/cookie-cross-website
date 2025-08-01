import { useMemo } from 'react';
import '../../styles/ui/Avatar.scss';

export default function  Avatar({ src, alt = 'Avatar', name = 'Anonym User', size = 'md', className, onclick }) {
    const initials = useMemo(() => {
        if (!name) return '';
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }, [name]);

    const sizeClasses = {
        sm: 'avatar--sm',
        md: 'avatar--md',
        lg: 'avatar--lg',
        xl: 'avatar--xl',
    };

    return (
        <div className={`avatar ${sizeClasses[size]} ${className}`} onClick={onclick} title={name}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="avatar__image"
                    onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.style.display = 'none';
                    }}
                />
            ) : (
                <span className="avatar__initials">{initials}</span>
            )}
        </div>
    );
};
