import DOMPurify from 'dompurify';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/SecureInput.scss';

export default function SecureInput({
    name,
    type,
    value,
    onChange,
    showPasswordToggle,
    onTogglePassword,
    ...props
}) {
    const handleChange = (e) => {
        let val;
        if (type === 'checkbox') {
            val = e.target.checked;
        } else if (type === 'password' || type === 'email') {
            // Ne pas sanitizer les passwords et emails pour éviter de corrompre les données
            val = e.target.value;
        } else {
            val = DOMPurify.sanitize(e.target.value, {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
        }
        onChange({ target: { name, value: val, type } });
    };


    return (
        <div className="input-wrapper">
            <input
                type={showPasswordToggle ? 'text' : type}
                name={name}
                checked={type === 'checkbox' ? value : undefined}
                value={type !== 'checkbox' ? value : undefined}
                onChange={handleChange}
                {...props}
            />
            {showPasswordToggle && (
                <button
                    type="button"
                    className="password-toggle"
                    onClick={onTogglePassword}
                    aria-label={props['aria-label']}
                >
                    {props.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}
        </div>
    )
}
