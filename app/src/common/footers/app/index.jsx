import { Link } from "react-router-dom";
import '../../../styles/footers/AppFooter.scss';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from "../../../contexts/AuthContext";
const logo = require('../../../assets/icons/white-no-bg.png');
const sberbank = require('../../../assets/banks/sber-bank.png');
const tinkoff = require('../../../assets/banks/tinkoff-bank.png');
const alfaBank = require('../../../assets/banks/alfa-bank.png');
const vtbBank = require('../../../assets/banks/vtb-bank.png');

export const AppFooter = () => {
    const { currentUser } = useAuth();
    return (
        <footer className="ads-footer">
            <div className="footer-columns">
                <div className="footer-branding">
                    <a href="/">
                        <img src={logo} className="footer-logo" alt="AdsCity logo" />
                    </a>
                    <p>AdsCity est la première plateforme panafricaine de petites annonces nouvelle génération en Russie.</p>
                    <div className="social-icons">
                        <a href="#fab"><FaFacebookF /></a>
                        <a href="#fab"><FaXTwitter /></a>
                        <a href="#fab"><FaLinkedinIn /></a>
                        <a href="#fab"><FaInstagram /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Pour les Vendeurs</h4>
                    <ul>
                        <li><Link to="/tips">Astuces de vente</Link></li>
                        {currentUser ? (
                            <li>
                                <Link to="/stores/create">Créer une boutique</Link>
                            </li>
                        ) : (
                            <li>
                                <Link to="/auth/signin?continue=/stores/create">
                                    Créer une boutique
                                </Link>
                            </li>
                        )}
                        <li><Link to="/boost">Booster une annonce</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Communauté</h4>
                    <ul>
                        <li><Link to="/groups">Groupes</Link></li>
                        <li><Link to="/forums">Forums</Link></li>
                        <li><Link to="/trending">Annonces populaires</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Aide & Support</h4>
                    <ul>
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/security">Centre de sécurité</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} AdsCity. Tous droits réservés.</p>
                <div className="payment-icons">
                    <img src={sberbank} alt="Sberbank" />
                    <img src={tinkoff} alt="Tinkoff" />
                    <img src={alfaBank} alt="Alfa Bank" />
                    <img src={vtbBank} alt="VTB Bank" />
                </div>
            </div>
        </footer>

    );
};