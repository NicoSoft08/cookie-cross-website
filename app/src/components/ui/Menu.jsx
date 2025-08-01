import { useEffect, useRef } from "react";
import '../../styles/ui/Menu.scss';

export default function Menu({ onClose, isOpen, options, onAction }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="menu" ref={menuRef}>
            {options.map((option, index) => (
                <div key={index} className="menu-item" onClick={() => onAction(option.action)}>
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                </div>
            ))}
        </div>
    );
};
