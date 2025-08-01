import '../../styles/ui/ProgressBar.scss';

export default function ProgressBar({ progress }) {
    return (
        <div className="progress-container">
            <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
            >
                <span className="progress-text">{`${progress}%`}</span>
            </div>
        </div>
    );
};
