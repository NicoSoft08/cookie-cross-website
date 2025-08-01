const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

exports.createSuperAdmin = async () => {
    try {
        console.log('🚀 Création du Super Admin\n');

        // Vérifier s'il existe déjà un super admin
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });

        if (existingSuperAdmin) {
            console.log('⚠️  Un Super Admin existe déjà!');
            console.log(`Email: ${existingSuperAdmin.email}`);
            console.log(`Username: ${existingSuperAdmin.username}`);

            const overwrite = await question('Voulez-vous créer un autre Super Admin? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('❌ Création annulée');
                return;
            }
        }

        // Collecter les informations
        const email = await question('Email: ');
        const username = await question('Username: ');
        const password = await question('Mot de passe: ');
        const firstName = await question('Prénom (optionnel): ');
        const lastName = await question('Nom (optionnel): ');

        // Validation basique
        if (!email || !username || !password) {
            throw new Error('Email, username et mot de passe sont requis');
        }

        // Vérifier si l'email ou username existe déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            throw new Error('Un utilisateur avec cet email ou username existe déjà');
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Créer le super admin
        const superAdmin = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                firstName: firstName || null,
                lastName: lastName || null,
                role: 'SUPER_ADMIN',
                isActive: true
            }
        });

        console.log('\n✅ Super Admin créé avec succès!');
        console.log(`ID: ${superAdmin.id}`);
        console.log(`Email: ${superAdmin.email}`);
        console.log(`Username: ${superAdmin.username}`);
        console.log(`Rôle: ${superAdmin.role}`);

    } catch (error) {
        console.error('❌ Erreur lors de la création du Super Admin:', error.message);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

