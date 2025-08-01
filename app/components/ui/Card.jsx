import '../../styles/ui/Card.scss';

export const Card = ({ className = '', children }) => {
    return <div className={`card ${className}`}>{children}</div>;
};

export const CardHeader = ({ className = '', children }) => {
    return <div className={`card__header ${className}`}>{children}</div>;
};

export const CardTitle = ({ className = '', children }) => {
    return <h3 className={`card__title ${className}`}>{children}</h3>;
};

export const CardDescription = ({ className = '', children }) => {
    return <p className={`card__description ${className}`}>{children}</p>;
};

export const CardContent = ({ className = '', children }) => {
    return <div className={`card__content ${className}`}>{children}</div>;
};

export const CardFooter = ({ className = '', children }) => {
    return <div className={`card__footer ${className}`}>{children}</div>;
};

export const CardItem = ({ title, children, className = '', action }) => {
    return (
        <div className={`card-item ${className}`}>
            <div className="card-header">
                <h2 className="card-title">{title}</h2>
                {action && <div className="card__action">{action}</div>}
            </div>
            <div className="card-body">
                {children}
            </div>
        </div>
    );
};