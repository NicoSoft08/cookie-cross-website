const bcrypt = require('bcryptjs');

exports.hashPassword = async (password) => {
    // Hash du mot de passe
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    return hash;
};

exports.comparePassword = async (password, hash) => {
    const match = await bcrypt.compare(password, hash);
    return match;
}