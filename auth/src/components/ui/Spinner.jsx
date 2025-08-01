import PropTypes from 'prop-types';
import '../../styles/ui/Spinner.scss';

// Import des composants react-activity
import { 
    Dots, 
    Levels, 
    Sentry, 
    Spinner as ActivitySpinner, 
    Squares, 
    Digital, 
    Bounce, 
    Windmill 
} from 'react-activity';

// Import des styles CSS
import 'react-activity/dist/Dots.css';
import 'react-activity/dist/Levels.css';
import 'react-activity/dist/Sentry.css';
import 'react-activity/dist/Spinner.css';
import 'react-activity/dist/Squares.css';
import 'react-activity/dist/Digital.css';
import 'react-activity/dist/Bounce.css';
import 'react-activity/dist/Windmill.css';

const Spinner = ({ 
    variant = 'spinner',
    size = 24,
    color = '#3b82f6',
    speed = 1,
    className = '',
    overlay = false,
    overlayColor = 'rgba(255, 255, 255, 0.8)',
    text = '',
    animating = true,
    ...props
}) => {
    // Configuration des props communes
    const commonProps = {
        size,
        color,
        speed,
        animating,
        className: `spinner-component ${className}`,
        ...props
    };

    // Mapping des variantes vers les composants
    const getSpinnerComponent = () => {
        switch (variant.toLowerCase()) {
            case 'dots':
                return <Dots {...commonProps} />;
            case 'levels':
                return <Levels {...commonProps} />;
            case 'sentry':
                return <Sentry {...commonProps} />;
            case 'spinner':
            case 'circular':
                return <ActivitySpinner {...commonProps} />;
            case 'squares':
                return <Squares {...commonProps} />;
            case 'digital':
                return <Digital {...commonProps} />;
            case 'bounce':
                return <Bounce {...commonProps} />;
            case 'windmill':
                return <Windmill {...commonProps} />;
            default:
                return <ActivitySpinner {...commonProps} />;
        }
    };

    const spinnerElement = (
        <div className={`spinner-wrapper ${text ? 'spinner-with-text' : ''}`}>
            {getSpinnerComponent()}
            {text && <span className="spinner-text">{text}</span>}
        </div>
    );

    // Si overlay est activé, envelopper dans un overlay
    if (overlay) {
        return (
            <div 
                className={`spinner-overlay ${animating ? 'spinner-overlay--active' : ''}`}
                style={{ backgroundColor: overlayColor }}
            >
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
};

Spinner.propTypes = {
    variant: PropTypes.oneOf([
        'dots', 
        'levels', 
        'sentry', 
        'spinner', 
        'circular',
        'squares', 
        'digital', 
        'bounce', 
        'windmill'
    ]),
    size: PropTypes.number,
    color: PropTypes.string,
    speed: PropTypes.number,
    className: PropTypes.string,
    overlay: PropTypes.bool,
    overlayColor: PropTypes.string,
    text: PropTypes.string,
    animating: PropTypes.bool
};

// Composants spécialisés pour un usage plus facile
export const DotsSpinner = (props) => <Spinner variant="dots" {...props} />;
export const LevelsSpinner = (props) => <Spinner variant="levels" {...props} />;
export const SentrySpinner = (props) => <Spinner variant="sentry" {...props} />;
export const CircularSpinner = (props) => <Spinner variant="spinner" {...props} />;
export const SquaresSpinner = (props) => <Spinner variant="squares" {...props} />;
export const DigitalSpinner = (props) => <Spinner variant="digital" {...props} />;
export const BounceSpinner = (props) => <Spinner variant="bounce" {...props} />;
export const WindmillSpinner = (props) => <Spinner variant="windmill" {...props} />;

// Composant de chargement avec overlay
export const LoadingOverlay = ({ isLoading, variant = 'spinner', text = 'Chargement...', ...props }) => {
    if (!isLoading) return null;
    
    return (
        <Spinner 
            variant={variant}
            overlay
            text={text}
            animating={isLoading}
            {...props}
        />
    );
};

LoadingOverlay.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    variant: PropTypes.string,
    text: PropTypes.string
};

export default Spinner;
