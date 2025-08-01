import { logos } from "../../config";
import '../../styles/ui/Loading.scss';

export default function Loading() {
    return (
        <div className="loading">
            <div className="loading-container">
                <img src={logos.letterWhiteBgBlue} alt="AdsCity" className="loading-logo" />
                <div className="loading-header">
                    <img src={logos.textBlueWithoutBg} alt="AdsCity" className="loading-text" />
                </div>
                <span className="loading-span">
                    Publiez, Vendez, Echangez
                </span>
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
};
