export default function FormData({ details }) {
    const formatSpecialFeatures = (features) => {
        if (!features) return '';

        if (Array.isArray(features)) {
            return features.join(', ');
        }

        if (typeof features === 'object') {
            const selectedFeatures = Object.entries(features)
                .filter(([_, selected]) => selected)
                .map(([feature]) => feature);
            return selectedFeatures.join(', ');
        }

        return features;
    };

    return (
        <div>
            {details?.vehicle_type !== undefined && details?.vehicle_type !== '' ? (<p>Type de véhicule: {details?.vehicle_type}</p>) : null}
            {details?.brand !== undefined && details?.brand !== '' ? (<p>Marque: {details?.brand}</p>) : null}
            {details?.model !== undefined && details?.model !== '' ? (<p>Modèle: {details?.model}</p>) : null}
            {details?.year !== undefined && details?.year !== '' ? (<p>Année: {details?.year}</p>) : null}
            {details?.mileage !== undefined && details?.mileage !== '' ? (<p>Kilométrage: {details?.mileage}</p>) : null}
            {details?.fuel_type !== undefined && details?.fuel_type !== '' ? (<p>Type de carburant: {details?.fuel_type}</p>) : null}
            {details?.gearbox !== undefined && details?.gearbox !== '' ? (<p>Transmission: {details?.gearbox}</p>) : null}
            {details?.doors !== undefined && details?.doors !== '' ? (<p>Nombre de portes: {details?.doors}</p>) : null}
            {details?.seats !== undefined && details?.seats !== '' ? (<p>Nombre de sièges: {details?.seats}</p>) : null}
            {details?.color !== undefined && details?.color !== '' ? (<p>Couleur: {details?.color}</p>) : null}
            {details?.condition !== undefined && details?.condition !== '' ? (<p>État: {details?.condition}</p>) : null}
            {details?.car_features !== undefined && details?.car_features !== '' ? (<p>Équipements: {formatSpecialFeatures(details?.car_features)}</p>) : null}
            {details?.documents !== undefined && details?.documents !== '' ? (<p>Documents disponibles: {formatSpecialFeatures(details?.documents)}</p>) : null}
            {details?.engine_capacity !== undefined && details?.engine_capacity !== '' ? (<p>Cylindrée (cc): {details?.engine_capacity}</p>) : null}
            {details?.seat_count !== undefined && details?.seat_count !== '' ? (<p>Nombre de places: {details?.seat_count}</p>) : null}
            {details?.rental_duration !== undefined && details?.rental_duration !== '' ? (<p>Durée de location: {details?.rental_duration}</p>) : null}
            {details?.rental_conditions !== undefined && details?.rental_conditions !== '' ? (<p>Conditions de location: {details?.rental_conditions}</p>) : null}

            {details?.availability !== undefined && details?.availability !== '' ? (<p>Disponibilité: {details?.availability}</p>) : null}
            {details?.category !== undefined && details?.category !== '' ? (<p>Catégorie: {details?.category}</p>) : null}
            {details?.compatibility !== undefined && details?.compatibility !== '' ? (<p>Compatibilité: {details?.compatibility}</p>) : null}
            {details?.exchange !== undefined && details?.exchange !== '' ? (<p>Échange possible: {details?.exchange}</p>) : null}
            {details?.screen_size !== undefined && details?.screen_size !== '' ? (<p>Taille de l'écran (pouces): {details?.screen_size}</p>) : null}
            {details?.screen_type !== undefined && details?.screen_type !== '' ? (<p>Type d'écran: {details?.screen_type}</p>) : null}
            {details?.refresh_rate !== undefined && details?.refresh_rate !== '' ? (<p>Taux de rafraîchissement (Hz): {details?.refresh_rate}</p>) : null}
            {details?.screen_protection !== undefined && details?.screen_protection !== '' ? (<p>Protection écran: {details?.screen_protection}</p>) : null}
            {details?.processor !== undefined && details?.processor !== '' ? (<p>Processeur: {details?.processor}</p>) : null}
            {details?.ram !== undefined && details?.ram !== '' ? (<p>RAM (Go): {details?.ram}</p>) : null}
            {details?.storage !== undefined && details?.storage !== '' ? (<p>Stockage interne (Go): {details?.storage}</p>) : null}
            {details?.expandable_storage !== undefined && details?.expandable_storage !== '' ? (<p>Stockage extensible: {details?.expandable_storage}</p>) : null}
            {details?.battery !== undefined && details?.battery !== '' ? (<p>Capacité de la batterie (mAh) : {details?.battery}</p>) : null}
            {details?.fast_charging !== undefined && details?.fast_charging !== '' ? (<p>Charge rapide (W) : {details?.fast_charging}</p>) : null}
            {details?.wireless_charging !== undefined && details?.wireless_charging !== '' ? (<p>Charge sans fil : {details?.wireless_charging}</p>) : null}
            {details?.main_camera !== undefined && details?.main_camera !== '' ? (<p>Caméra principale (MP) : {details?.main_camera}</p>) : null}
            {details?.num_cameras !== undefined && details?.num_cameras !== '' ? (<p>Nombre de capteurs  : {details?.num_cameras}</p>) : null}

            {details?.front_camera !== undefined && details?.front_camera !== '' ? (<p>Caméra frontale (MP): {details?.front_camera}</p>) : null}
            {details?.connectivity !== undefined && details?.connectivity !== '' ? (<p>Connectivité: {formatSpecialFeatures(details?.connectivity)}</p>) : null}
            {details?.fingerprint !== undefined && details?.fingerprint !== '' ? (<p>Capteur d'empreintes: {details?.fingerprint}</p>) : null}
            {details?.face_recognition !== undefined && details?.face_recognition !== '' ? (<p>Reconnaissance faciale: {details?.face_recognition}</p>) : null}
            {details?.water_resistant !== undefined && details?.water_resistant !== '' ? (<p>Résistance à l'eau: {details?.water_resistant}</p>) : null}
            {details?.materials !== undefined && details?.materials !== '' ? (<p>Matériaux du châssis: {details?.materials}</p>) : null}
            {details?.accessories !== undefined && details?.accessories !== '' ? (<p>Accessoires inclus: {formatSpecialFeatures(details?.accessories)}</p>) : null}
            {details?.gpu !== undefined && details?.gpu !== '' ? (<p>Carte graphique: {details?.gpu}</p>) : null}
            {details?.operating_system !== undefined && details?.operating_system !== '' ? (<p>Système d'exploitation: {details?.operating_system}</p>) : null}
            {details?.power_supply !== undefined && details?.power_supply !== '' ? (<p>Alimentation (W): {details?.power_supply}</p>) : null}
            {details?.ports !== undefined && details?.ports !== '' ? (<p>Ports disponibles: {formatSpecialFeatures(details?.ports)}</p>) : null}
            {details?.form_factor !== undefined && details?.form_factor !== '' ? (<p>Format du PC: {details?.form_factor}</p>) : null}
            {details?.cooling_system !== undefined && details?.cooling_system !== '' ? (<p>Système de refroidissement: {details?.cooling_system}</p>) : null}
            {details?.keyboard_mouse !== undefined && details?.keyboard_mouse !== '' ? (<p>Clavier & Souris inclus: {details?.keyboard_mouse}</p>) : null}
            {details?.monitor !== undefined && details?.monitor !== '' ? (<p>Écran inclus: {details?.monitor}</p>) : null}
            {details?.resolution !== undefined && details?.resolution !== '' ? (<p>Résolution de l'écran: {details?.resolution}</p>) : null}
            {details?.battery_life !== undefined && details?.battery_life !== '' ? (<p>Autonomie de la batterie (en heures): {details?.battery_life}</p>) : null}
            {details?.touchscreen !== undefined && details?.touchscreen !== '' ? (<p>Écran tactile: {details?.touchscreen}</p>) : null}
            {details?.keyboard_backlit !== undefined && details?.keyboard_backlit !== '' ? (<p>Clavier rétroéclairé: {details?.keyboard_backlit}</p>) : null}
            {details?.weight !== undefined && details?.weight !== '' ? (<p>Poids (kg): {details?.weight}</p>) : null}

            {details?.webcam !== undefined && details?.webcam !== '' ? (<p>Webcam intégrée: {details?.webcam}</p>) : null}
            {details?.features !== undefined && details?.features !== '' ? (<p>Caractéristiques spéciales: {formatSpecialFeatures(details?.features)}</p>) : null}
            {details?.power_output !== undefined && details?.power_output !== '' ? (<p>Puissance de sortie (Watts): {details?.power_output}</p>) : null}
            {details?.frequency_response !== undefined && details?.frequency_response !== '' ? (<p>Réponse en fréquence (Hz): {details?.frequency_response}</p>) : null}
            {details?.wireless_standard !== undefined && details?.wireless_standard !== '' ? (<p>Norme sans fil: {details?.wireless_standard}</p>) : null}
            {details?.storage_capacity !== undefined && details?.storage_capacity !== '' ? (<p>Capacité de stockage: {details?.storage_capacity}</p>) : null}
            {details?.game_title !== undefined && details?.game_title !== '' ? (<p>Titre du jeu: {details?.game_title}</p>) : null}
            {details?.platform !== undefined && details?.platform !== '' ? (<p>Plateforme: {details?.platform}</p>) : null}
            {details?.edition !== undefined && details?.edition !== '' ? (<p>Édition du jeu: {details?.edition}</p>) : null}
            {details?.online_subscription !== undefined && details?.online_subscription !== '' ? (<p>Abonnement en ligne inclus: {details?.online_subscription}</p>) : null}
            {details?.accessories_included !== undefined && details?.accessories_included !== '' ? (<p>Accessoires inclus: {formatSpecialFeatures(details?.accessories_included)}</p>) : null}
            {details?.material !== undefined && details?.material !== '' ? (<p>Matériau: {details?.material}</p>) : null}
            {details?.capacity !== undefined && details?.capacity !== '' ? (<p>Capacité (mAh ou Go): {details?.capacity}</p>) : null}
            {details?.device_type !== undefined && details?.device_type !== '' ? (<p>Type d'appareil: {details?.device_type}</p>) : null}
            {details?.megapixels !== undefined && details?.megapixels !== '' ? (<p>Résolution (MP): {details?.megapixels}</p>) : null}
            {details?.sensor_size !== undefined && details?.sensor_size !== '' ? (<p>Taille du capteur: {details?.sensor_size}</p>) : null}
            {details?.lens_mount !== undefined && details?.lens_mount !== '' ? (<p>Monture d'objectif: {details?.lens_mount}</p>) : null}
            {details?.video_resolution !== undefined && details?.video_resolution !== '' ? (<p>Résolution vidéo: {details?.video_resolution}</p>) : null}
            {details?.type_vetement !== undefined && details?.type_vetement !== '' ? (<p>Type de vêtement: {details?.type_vetement}</p>) : null}
            {details?.matiere !== undefined && details?.matiere !== '' ? (<p>Matière: {details?.matiere}</p>) : null}

            {details?.saison !== undefined && details?.saison !== '' ? (<p>Saison: {details?.saison}</p>) : null}
            {details?.style !== undefined && details?.style !== '' ? (<p>Style: {details?.style}</p>) : null}
            {details?.longueur_manches !== undefined && details?.longueur_manches !== '' ? (<p>Longueur des manches: {details?.longueur_manches}</p>) : null}
            {details?.size !== undefined && details?.size !== '' ? (<p>Taille: {formatSpecialFeatures(details?.size)}</p>) : null}
            {details?.type_chaussure !== undefined && details?.type_chaussure !== '' ? (<p>Type de chaussure: {details?.type_chaussure}</p>) : null}
            {details?.pointure !== undefined && details?.pointure !== '' ? (<p>Pointure: {formatSpecialFeatures(details?.pointure)}</p>) : null}
            {details?.hauteur_talon !== undefined && details?.hauteur_talon !== '' ? (<p>Hauteur du talon: {details?.hauteur_talon}</p>) : null}
            {details?.type_accessoire !== undefined && details?.type_accessoire !== '' ? (<p>Type d'accessoire: {details?.type_accessoire}</p>) : null}
            {details?.genre !== undefined && details?.genre !== '' ? (<p>Genre: {details?.genre}</p>) : null}
            {details?.type_produit !== undefined && details?.type_produit !== '' ? (<p>Type de produit: {details?.type_produit}</p>) : null}
            {details?.volume !== undefined && details?.volume !== '' ? (<p>Volume / Contenance: {details?.volume}</p>) : null}
            {details?.composition !== undefined && details?.composition !== '' ? (<p>Composition: {details?.composition}</p>) : null}
            {details?.type_peau !== undefined && details?.type_peau !== '' ? (<p>Type de peau: {details?.type_peau}</p>) : null}
            {details?.origine !== undefined && details?.origine !== '' ? (<p>Origine: {details?.origine}</p>) : null}
            {details?.dimensions !== undefined && details?.dimensions !== '' ? (<p>Dimensions: {details?.dimensions}</p>) : null}
            {details?.longueur !== undefined && details?.longueur !== '' ? (<p>Longueur (si applicable): {details?.longueur}</p>) : null}
            {details?.texture !== undefined && details?.texture !== '' ? (<p>Texture des cheveux: {details?.texture}</p>) : null}
            {details?.fixation !== undefined && details?.fixation !== '' ? (<p>Type de fixation: {details?.fixation}</p>) : null}
            {details?.type_sous_vetement !== undefined && details?.type_sous_vetement !== '' ? (<p>Type de sous-vêtement: {details?.type_sous_vetement}</p>) : null}
            {details?.property_type !== undefined && details?.property_type !== '' ? (<p>Type de propriété: {details?.property_type}</p>) : null}
            {details?.transaction_type !== undefined && details?.transaction_type !== '' ? (<p>Type de transaction: {details?.transaction_type}</p>) : null}
            {details?.area !== undefined && details?.area !== '' ? (<p>Superficie (m²): {details?.area}</p>) : null}
            {details?.bedrooms !== undefined && details?.bedrooms !== '' ? (<p>Nombre de chambres: {details?.bedrooms}</p>) : null}

            {details?.bathrooms !== undefined && details?.bathrooms !== '' ? (<p>Nombre de salles de bain: {details?.bathrooms}</p>) : null}
            {details?.furnished !== undefined && details?.furnished !== '' ? (<p>Meublé: {details?.furnished}</p>) : null}
            {details?.parking !== undefined && details?.parking !== '' ? (<p>Parking: {details?.parking}</p>) : null}
            {details?.swimming_pool !== undefined && details?.swimming_pool !== '' ? (<p>Piscine: {details?.swimming_pool}</p>) : null}
            {details?.garden !== undefined && details?.garden !== '' ? (<p>Jardin: {details?.garden}</p>) : null}
            {details?.residence_type !== undefined && details?.residence_type !== '' ? (<p>Type de résidence: {details?.residence_type}</p>) : null}
            {details?.floor !== undefined && details?.floor !== '' ? (<p>Étage: {details?.floor}</p>) : null}
            {details?.elevator !== undefined && details?.elevator !== '' ? (<p>Ascenseur: {details?.elevator}</p>) : null}
            {details?.security !== undefined && details?.security !== '' ? (<p>Sécurité 24/7: {details?.security}</p>) : null}
            {details?.balcony !== undefined && details?.balcony !== '' ? (<p>Balcon: {details?.balcony}</p>) : null}
            {details?.gym !== undefined && details?.gym !== '' ? (<p>Salle de sport: {details?.gym}</p>) : null}
            {details?.age_range !== undefined && details?.age_range !== '' ? (<p>Tranche d'âge: {details?.age_range}</p>) : null}
            {details?.type_instrument !== undefined && details?.type_instrument !== '' ? (<p>Type d'instrument: {details?.type_instrument}</p>) : null}
            {details?.event_name !== undefined && details?.event_name !== '' ? (<p>Nom de l'événement: {details?.event_name}</p>) : null}
            {details?.event_type !== undefined && details?.event_type !== '' ? (<p>Type d'événement: {details?.event_type}</p>) : null}
            {details?.date !== undefined && details?.date !== '' ? (<p>Date de l'événement: {details?.date}</p>) : null}
            {details?.time !== undefined && details?.time !== '' ? (<p>Heure de l'événement: {details?.time}</p>) : null}
            {details?.event_location !== undefined && details?.event_location !== '' ? (<p>Lieu de l'événement: {details?.event_location}</p>) : null}
            {details?.product_type !== undefined && details?.product_type !== '' ? (<p>Type de produit: {details?.product_type}</p>) : null}
            {details?.home_service !== undefined && details?.home_service !== '' ? (<p>Service à domicile: {details?.home_service}</p>) : null}
            {details?.unit_of_measure !== undefined && details?.unit_of_measure !== '' ? (<p>Unité de mesure: {details?.unit_of_measure}</p>) : null}
            {details?.quantity !== undefined && details?.quantity !== '' ? (<p>Quantité: {details?.quantity}</p>) : null}
            {details?.delievery !== undefined && details?.delievery !== '' ? (<p>Méthode de livraison: {details?.delievery}</p>) : null}

        </div>
    );
};
