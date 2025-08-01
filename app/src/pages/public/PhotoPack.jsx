import { Camera, Check, Clock, Crown, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import '../../styles/public/PhotoPack.scss';

const iconsMap = {
    Camera: <Camera size={32} />,
    Zap: <Zap size={32} />,
    Crown: <Crown size={32} />
};

const PackItem = ({ pack }) => {
    const {
        name,
        description,
        extraImages,
        durationDays,
        price,
        icon,
        popular,
        color,
        features = []
    } = pack;

    return (
        <div className={`pack-item ${popular ? 'popular' : ''} color-${color}`}>
            <div className="pack-header">
                <div className="pack-icon">{iconsMap[icon]}</div>
                <h3 className="pack-name">{name}</h3>
                <p className="pack-description">{description}</p>
            </div>

            <ul className="pack-features">
                <li>+{extraImages === 99999 ? '∞' : extraImages} photos supplémentaires</li>
                <li>Valable {durationDays} jours</li>
                <li>Prix : {price.toLocaleString()} FCFA</li>
                {features.map((f, index) => (
                    <li key={index}>{f}</li>
                ))}
            </ul>

            <button className="pack-cta">Choisir ce pack</button>
        </div>
    );
};

export default function PhotoPack() {
    const [packs, setPacks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('http://localhost:4000/api/plans/services/photo-pack', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) return null

            const data = await res.json();
            console.log(data)
            setPacks(data.data)
        };

        fetchData();
    }, []);

    return (
        <div className="photo-packs">
            <header className="packs-header">
                <div className="icon-wrapper">
                    <Camera className="icon" />
                </div>
                <h1>Packs Photo</h1>
                <p>Boostez vos annonces avec des photos supplémentaires. Choisissez le pack qui correspond à vos besoins.</p>
            </header>

            <section className="packs-list">
                {packs.map((pack) => {
                    const iconsMap = {
                        Camera: <Camera size={32} />,
                        Zap: <Zap size={32} />,
                        Crown: <Crown size={32} />
                    };

                    return (
                        <div className={`pack-card ${pack.color} ${pack.popular ? 'popular' : ''}`} key={pack.id}>
                            {pack.popular && (
                                <div className="badge-popular">
                                    <Star size={16} />
                                    Le Plus Populaire
                                </div>
                            )}
                            <div className="pack-header">
                                <div className="icon-circle">
                                    {iconsMap[pack.icon]}
                                </div>
                                <h3>{pack.name}</h3>
                                <p className="description">{pack.description}</p>
                                <div className="price">{pack.price} FCFA</div>
                            </div>
                            <div className="pack-details">
                                <div className="stats">
                                    <div>
                                        <strong>{pack.extraImages === 'unlimited' ? '∞' : `+${pack.extraImages}`}</strong>
                                        <span>Photos</span>
                                    </div>
                                    <div>
                                        <strong>{pack.listings}</strong>
                                        <span>{pack.listings === 1 ? 'Annonce' : 'Annonces'}</span>
                                    </div>
                                    <div>
                                        <strong><Clock size={16} /> {pack.durationDays}j</strong>
                                        <span>Durée</span>
                                    </div>
                                </div>
                                <ul className="features">
                                    {pack.features.map((feature, i) => (
                                        <li key={i}>
                                            <Check size={14} /> {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className="btn-select">Choisir ce pack</button>
                            </div>
                        </div>
                    );
                })}
            </section>

            <section className="how-it-works">
                <h3>Comment ça marche ?</h3>
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div>
                            <strong>Choisissez votre pack</strong>
                            <p>Sélectionnez le pack qui correspond le mieux à vos besoins.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div>
                            <strong>Activez sur vos annonces</strong>
                            <p>Utilisez vos crédits photo sur les annonces de votre choix.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <div>
                            <strong>Attirez plus d'acheteurs</strong>
                            <p>Plus de photos = plus de vues et de chances de vendre.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
