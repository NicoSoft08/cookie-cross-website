export function calculateProfileStatus(user) {
    const missing = [];

    const checks = [
        { key: 'firstName', label: "Prénom" },
        { key: 'lastName', label: "Nom" },
        { key: 'gender', label: "Genre" },
        { key: 'avatar', label: "Photo de profil" },
        { key: 'email', label: "Email" },
        { key: 'emailVerified', label: "Vérification de l'email" },
        { key: 'phoneNumber', label: "Numéro de téléphone" },
        { key: 'phoneVerified', label: "Vérification du téléphone" },
        { key: 'country', label: "Pays" },
        { key: 'city', label: "Ville" },
        { key: 'address', label: "Domicile" },
        { key: 'workAddress', label: "Travail" },
    ];

    let completed = 0;

    for (const check of checks) {
        const keys = check.key.split('.');
        let value = user;
        for (const k of keys) value = value?.[k];

        if (value === undefined || value === null) {
            missing.push(check.label);
        } else {
            completed++;
        }

    }

    const total = checks.length;
    const percent = Math.round((completed / total) * 100);

    return { percent, missing };
}