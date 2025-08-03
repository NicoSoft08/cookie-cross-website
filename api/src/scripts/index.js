const bcrypt = require('bcryptjs');
const prisma = require('../prisma-client/prisma');

const mockUser = {
    email: 'user@example.com',
    name: 'John Doe',
    password: 'MySecurePassword123',
}

exports.main = async () => {
    try {
        // Add user mock data in case the database is empty
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(mockUser.password, salt);

        const user = {
            email: mockUser.email,
            displayName: mockUser.name,
            password: hash,
        }

        const exist = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (exist) {
            console.log('User already exists:', exist);
            return;
        }

        // Save the user to the database
        const createdUser = await prisma.user.create({
            data: user,
        });

        console.log('Mock user created:', createdUser);
    } catch (error) {
        console.error('Error in main function:', error);
    }
};