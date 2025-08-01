import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import '../../styles/ui/Toast.scss';

export default function Toast({ type = 'info', message, show, onClose, duration = 3000 }) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (show) {
            let interval = null;

            const startTime = Date.now();
            interval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(duration - elapsedTime, 0);
                setProgress((remainingTime / duration) * 100);

                if (remainingTime <= 0) {
                    clearInterval(interval);
                    onClose();
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [show, onClose, duration]);

    const renderIcon = () => {
        switch (type) {
            case 'success':
                return faCheckCircle;
            case 'error':
                return faExclamationCircle;
            case 'info':
                return faInfoCircle;
            default:
                return faInfoCircle;
        }
    };

    if (!show) return null;

    return (
        <div className={`toast ${type}`}>
            <FontAwesomeIcon className="toast-icon" icon={renderIcon()} />
            <div className="toast-message">
                <p>{message}</p>
            </div>
            <span className="close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></span>
            <div className="toast-progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};
