import '../styles/notification-toast.scss';

export default function NotificationToast({ accept, reject, isVisible }) {
    if (!isVisible) return null;

    return (
        <div className="notification-toast">
            <p>Souhaitez-vous activer les notifications ?</p>
            <div className="actions">
                <button className="accept" onClick={accept}>Activer</button>
                <button className="reject" onClick={reject}>Plus tard</button>
            </div>
        </div>
    );
}
