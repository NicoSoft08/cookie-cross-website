const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

// Fonction améliorée avec gestion des erreurs détaillée
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: 'image',
            quality: 'auto:good',
            fetch_format: 'auto'
        };

        const stream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    return reject(new Error(`Cloudinary: ${error.message}`));
                }
                if (!result || !result.secure_url) {
                    return reject(new Error('Réponse invalide de Cloudinary'));
                }
                resolve(result);
            }
        );

        stream.on('error', (error) => {
            reject(new Error(`Stream error: ${error.message}`));
        });

        stream.end(buffer);
    });
};

const uploadImgCategoryToCloudinary = async (filePath) => {
    try {
        // Lire le fichier depuis le disque
        const fileBuffer = await fs.readFile(filePath);

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'categories', // Organisez les images dans un dossier
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        console.error('Erreur Cloudinary:', error);
                        return reject(error);
                    }
                    resolve(result.secure_url); // Retourne l'URL sécurisée
                }
            );

            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        console.error('Erreur lecture fichier:', error);
        throw error;
    }
};

module.exports = {
    uploadToCloudinary,
    uploadImgCategoryToCloudinary
};
