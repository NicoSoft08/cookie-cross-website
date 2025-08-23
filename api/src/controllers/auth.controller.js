const bcrypt = require('bcryptjs');
const prisma = require('../prisma-client/prisma');
const { comparePassword, hashPassword } = require('../utils/jwt');

exports.register = async (email, password, username) => {
    try {
        // Vérifie si l'utilisateur existe déjà
        const exist = await prisma.user.findUnique({
            where: { email },
        });

        if (exist) return null; // déjà pris

        // Hash du mot de passe
        const hash = await hashPassword(password);

        const created = await prisma.user.create({
            data: {
                displayName: username,
                email,
                password: hash,
            },
        });

        // Ne renvoie pas le hash
        return {
            id: created.id,
            email: created.email,
            username: created.displayName,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

exports.login = async (email, password) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        const match = await comparePassword(password, user.password);
        if (!match) return null;

        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};
