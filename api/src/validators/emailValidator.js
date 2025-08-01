const api_key = process.env.ABSTRACT_API_KEY;

exports.validateEmail = async (email) => {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${api_key}&email=${encodeURIComponent(email)}`;

    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) {
        throw new Error("Échec de la validation de l'email");
    }

    const result = await res.json();
    return result;
};