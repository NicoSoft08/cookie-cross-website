import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef } from 'react';
import '../../styles/ui/Modal.scss';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'medium', // small, medium, large, fullscreen
    variant = 'default', // default, danger, success, warning, info
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    overlayClassName = '',
    preventBodyScroll = true,
    animation = 'fade', // fade, slide, zoom
    centered = true,
    backdrop = true,
    keyboard = true,
    ...props
}) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Gestion du focus et de l'accessibilité
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            modalRef.current?.focus();

            if (preventBodyScroll) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            if (preventBodyScroll) {
                document.body.style.overflow = '';
            }

            // Restaurer le focus
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }

        return () => {
            if (preventBodyScroll) {
                document.body.style.overflow = '';
            }
        };
    }, [isOpen, preventBodyScroll]);

    // Gestion des touches clavier
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isOpen) return;

            if (event.key === 'Escape' && closeOnEscape && keyboard) {
                onClose();
            }

            // Piéger le focus dans le modal
            if (event.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements?.length) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (event.shiftKey && document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    } else if (!event.shiftKey && document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape, keyboard, onClose]);

    // Gestion du clic sur l'overlay
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && closeOnOverlayClick) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`modal-overlay ${overlayClassName} ${animation} ${backdrop ? 'with-backdrop' : ''}`}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                ref={modalRef}
                className={`modal ${size} ${variant} ${centered ? 'centered' : ''} ${className}`}
                tabIndex={-1}
                {...props}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className={`modal-header ${headerClassName}`}>
                        {title && (
                            <h2 id="modal-title" className="modal-title">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={onClose}
                                aria-label="Fermer le modal"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className={`modal-body ${bodyClassName}`}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className={`modal-footer ${footerClassName}`}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
