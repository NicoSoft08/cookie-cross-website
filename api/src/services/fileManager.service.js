const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class FileManagerService {

    /**
   * Traiter les images uploadées pour une annonce
   */
    static async processListingImages(files, listingId, userId) {
        try {
            if (!files || files.length === 0) {
                return { success: true, images: [] };
            }

            const processedImages = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Créer l'enregistrement en base de données
                const imageRecord = await prisma.listingImage.create({
                    data: {
                        listingId: listingId,
                        userId: userId,
                        publicId: file.filename,
                        url: file.path,
                        secureUrl: file.path.replace('http://', 'https://'),
                        originalName: file.originalname,
                        format: file.format || this.getFileExtension(file.originalname),
                        width: file.width || null,
                        height: file.height || null,
                        bytes: file.size || 0,
                        isMain: i === 0, // La première image est l'image principale
                        displayOrder: i + 1,
                        uploadedAt: new Date()
                    }
                });

                processedImages.push({
                    id: imageRecord.id,
                    url: imageRecord.secureUrl,
                    publicId: imageRecord.publicId,
                    isMain: imageRecord.isMain,
                    displayOrder: imageRecord.displayOrder
                });
            }

            console.log(`✅ ${processedImages.length} images traitées pour l'annonce ${listingId}`);

            return {
                success: true,
                images: processedImages,
                mainImage: processedImages.find(img => img.isMain)
            };

        } catch (error) {
            console.error('❌ Erreur lors du traitement des images:', error);

            // En cas d'erreur, supprimer les fichiers de Cloudinary
            if (files && files.length > 0) {
                await this.cleanupFailedUploads(files.map(f => f.filename));
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
  * Mettre à jour les images d'une annonce
  */
    static async updateListingImages(listingId, newFiles, imagesToDelete = [], newMainImageId = null) {
        try {
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                include: { images: true }
            });

            if (!listing) {
                throw new Error('Annonce non trouvée');
            }

            // Supprimer les images sélectionnées
            if (imagesToDelete.length > 0) {
                await this.deleteAdImages(imagesToDelete);
            }

            // Ajouter les nouvelles images
            let newImages = [];
            if (newFiles && newFiles.length > 0) {
                const currentImagesCount = await prisma.listingImage.count({
                    where: { listingId: listingId }
                });

                const result = await this.processListingImages(newFiles, listingId, ad.userId);
                if (result.success) {
                    // Mettre à jour l'ordre d'affichage
                    for (let i = 0; i < result.images.length; i++) {
                        await prisma.listingImage.update({
                            where: { id: result.images[i].id },
                            data: { displayOrder: currentImagesCount + i + 1 }
                        });
                    }
                    newImages = result.images;
                }
            }

            // Définir une nouvelle image principale si spécifiée
            if (newMainImageId) {
                await this.setMainImage(listingId, newMainImageId);
            }

            // Récupérer toutes les images mises à jour
            const updatedImages = await prisma.listingImage.findMany({
                where: { id: listingId },
                orderBy: { order: 'asc' }
            });

            return {
                success: true,
                images: updatedImages,
                newImagesCount: newImages.length,
                deletedImagesCount: imagesToDelete.length
            };

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour des images:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Définir l'image principale d'une annonce
   */
    static async setMainImage(listingId, imageId) {
        try {
            // Retirer le statut principal de toutes les images
            await prisma.listingImage.updateMany({
                where: { id: listingId },
                data: { isMain: false }
            });

            // Définir la nouvelle image principale
            const updatedImage = await prisma.listingImage.update({
                where: {
                    id: imageId,
                    listingId: listingId // Sécurité : s'assurer que l'image appartient à cette annonce
                },
                data: { isMain: true }
            });

            return {
                success: true,
                mainImage: updatedImage
            };

        } catch (error) {
            console.error('❌ Erreur lors de la définition de l\'image principale:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Supprimer des images d'annonce
   */
    static async deleteAdImages(imageIds) {
        try {
            if (!Array.isArray(imageIds) || imageIds.length === 0) {
                return { success: true, deletedCount: 0 };
            }

            // Récupérer les informations des images à supprimer
            const imagesToDelete = await prisma.listingImage.findMany({
                where: { id: { in: imageIds } },
                select: { id: true, publicId: true, listingId: true }
            });

            if (imagesToDelete.length === 0) {
                return { success: true, deletedCount: 0 };
            }

            // Supprimer de Cloudinary
            const publicIds = imagesToDelete.map(img => img.publicId);
            const cloudinaryResult = await cloudinary.api.delete_resources(publicIds);

            // Supprimer de la base de données
            const dbResult = await prisma.listingImage.deleteMany({
                where: { id: { in: imageIds } }
            });

            // Réorganiser l'ordre d'affichage des images restantes
            for (const img of imagesToDelete) {
                await this.reorderImages(img.listingId);
            }

            console.log(`✅ ${dbResult.count} images supprimées`);

            return {
                success: true,
                deletedCount: dbResult.count,
                cloudinaryDeleted: Object.keys(cloudinaryResult.deleted).length
            };

        } catch (error) {
            console.error('❌ Erreur lors de la suppression des images:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Réorganiser l'ordre des images après suppression
   */
    static async reorderImages(listingId) {
        try {
            const images = await prisma.listingImage.findMany({
                where: { id: listingId },
                orderBy: { order: 'asc' }
            });

            for (let i = 0; i < images.length; i++) {
                await prisma.listingImage.update({
                    where: { id: images[i].id },
                    data: { order: i + 1 }
                });
            }

            // S'assurer qu'il y a une image principale
            const hasMainImage = images.some(img => img.isMain);
            if (!hasMainImage && images.length > 0) {
                await prisma.listingImage.update({
                    where: { id: images[0].id },
                    data: { isMain: true }
                });
            }

        } catch (error) {
            console.error('❌ Erreur lors de la réorganisation:', error);
        }
    }

    /**
  * Supprimer toutes les images d'une annonce
  */
    static async deleteAllAdImages(listingId) {
        try {
            const images = await prisma.listingImage.findMany({
                where: { id: listingId },
                select: { id: true, publicId: true }
            });

            if (images.length === 0) {
                return { success: true, deletedCount: 0 };
            }

            const imageIds = images.map(img => img.id);
            return await this.deleteAdImages(imageIds);

        } catch (error) {
            console.error('❌ Erreur lors de la suppression de toutes les images:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Nettoyer les uploads échoués
   */
    static async cleanupFailedUploads(publicIds) {
        try {
            if (!publicIds || publicIds.length === 0) return;

            await cloudinary.api.delete_resources(publicIds);
            console.log(`🧹 ${publicIds.length} fichiers nettoyés de Cloudinary`);

        } catch (error) {
            console.error('❌ Erreur lors du nettoyage:', error);
        }
    }

    /**
   * Obtenir les statistiques de stockage
   */
    static async getStorageStats(userId = null) {
        try {
            const whereClause = userId ? { userId: userId } : {};

            const stats = await prisma.listingImage.aggregate({
                where: whereClause,
                _count: { id: true },
                _sum: { bytes: true }
            });

            const totalImages = stats._count.id || 0;
            const totalSize = stats._sum.bytes || 0;

            return {
                success: true,
                stats: {
                    totalImages,
                    totalSize,
                    totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
                    averageSize: totalImages > 0 ? Math.round(totalSize / totalImages) : 0
                }
            };

        } catch (error) {
            console.error('❌ Erreur lors de la récupération des stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
  * Optimiser une image existante
  */
    static async optimizeImage(imageId, transformations = {}) {
        try {
            const image = await prisma.listingImage.findUnique({
                where: { id: imageId }
            });

            if (!image) {
                throw new Error('Image non trouvée');
            }

            const defaultTransformations = {
                quality: 'auto:good',
                fetch_format: 'auto',
                ...transformations
            };

            // Générer l'URL optimisée
            const optimizedUrl = cloudinary.url(image.publicId, {
                transformation: defaultTransformations
            });

            // Mettre à jour l'URL en base de données si nécessaire
            await prisma.listingImage.update({
                where: { id: imageId },
                data: {
                    secureUrl: optimizedUrl,
                    updatedAt: new Date()
                }
            });

            return {
                success: true,
                optimizedUrl,
                transformations: defaultTransformations
            };

        } catch (error) {
            console.error('❌ Erreur lors de l\'optimisation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Générer des miniatures pour une image
   */
    static async generateThumbnails(imageId) {
        try {
            const image = await prisma.listingImage.findUnique({
                where: { id: imageId }
            });

            if (!image) {
                throw new Error('Image non trouvée');
            }

            const thumbnailSizes = [
                { name: 'small', width: 150, height: 150 },
                { name: 'medium', width: 300, height: 300 },
                { name: 'large', width: 600, height: 400 }
            ];

            const thumbnails = {};

            for (const size of thumbnailSizes) {
                thumbnails[size.name] = cloudinary.url(image.publicId, {
                    transformation: [
                        { width: size.width, height: size.height, crop: 'fill' },
                        { quality: 'auto:good', fetch_format: 'auto' }
                    ]
                });
            }

            // Sauvegarder les URLs des miniatures
            await prisma.listingImage.update({
                where: { id: imageId },
                data: {
                    thumbnails: JSON.stringify(thumbnails),
                    updatedAt: new Date()
                }
            });

            return {
                success: true,
                thumbnails
            };

        } catch (error) {
            console.error('❌ Erreur lors de la génération des miniatures:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Valider les fichiers avant upload
   */
    static validateFiles(files, options = {}) {
        const {
            maxFiles = 10,
            maxFileSize = 10 * 1024 * 1024, // 10MB
            allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        } = options;

        const errors = [];

        if (!files || files.length === 0) {
            return { valid: true, errors: [] };
        }

        if (files.length > maxFiles) {
            errors.push(`Maximum ${maxFiles} fichiers autorisés`);
        }

        files.forEach((file, index) => {
            // Vérifier la taille
            if (file.size > maxFileSize) {
                errors.push(`Fichier ${index + 1}: Taille maximale ${Math.round(maxFileSize / (1024 * 1024))}MB dépassée`);
            }

            // Vérifier le type
            if (!allowedTypes.includes(file.mimetype)) {
                errors.push(`Fichier ${index + 1}: Type ${file.mimetype} non autorisé`);
            }

            // Vérifier le nom de fichier
            if (!file.originalname || file.originalname.length > 255) {
                errors.push(`Fichier ${index + 1}: Nom de fichier invalide`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
   * Nettoyer les images orphelines (non liées à une annonce)
   */
    static async cleanupOrphanImages() {
        try {
            // Trouver les images sans annonce associée
            const orphanImages = await prisma.listingImage.findMany({
                where: {
                    listing: null
                },
                select: { id: true, publicId: true }
            });

            if (orphanImages.length === 0) {
                return {
                    success: true,
                    message: 'Aucune image orpheline trouvée',
                    deletedCount: 0
                };
            }

            // Supprimer de Cloudinary
            const publicIds = orphanImages.map(img => img.publicId);
            await cloudinary.api.delete_resources(publicIds);

            // Supprimer de la base de données
            const result = await prisma.listingImage.deleteMany({
                where: {
                    id: { in: orphanImages.map(img => img.id) }
                }
            });

            console.log(`🧹 ${result.count} images orphelines supprimées`);

            return {
                success: true,
                message: `${result.count} images orphelines supprimées`,
                deletedCount: result.count
            };

        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des images orphelines:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Nettoyer les images anciennes (plus de X jours)
   */
    static async cleanupOldImages(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            // Trouver les images anciennes d'annonces supprimées
            const oldImages = await prisma.listingImage.findMany({
                where: {
                    uploadedAt: { lt: cutoffDate },
                    listing: {
                        deletedAt: { not: null }
                    }
                },
                select: { id: true, publicId: true }
            });

            if (oldImages.length === 0) {
                return {
                    success: true,
                    message: 'Aucune ancienne image à supprimer',
                    deletedCount: 0
                };
            }

            const imageIds = oldImages.map(img => img.id);
            const result = await this.deleteAdImages(imageIds);

            return {
                success: true,
                message: `${result.deletedCount} anciennes images supprimées`,
                deletedCount: result.deletedCount
            };

        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des anciennes images:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Obtenir les informations détaillées d'une image
   */
    static async getImageDetails(imageId) {
        try {
            const image = await prisma.listingImage.findUnique({
                where: { id: imageId },
                include: {
                    listing: {
                        select: { id: true, title: true, status: true }
                    },
                    user: {
                        select: { id: true, firstName: true, lastName: true }
                    }
                }
            });

            if (!image) {
                return {
                    success: false,
                    error: 'Image non trouvée'
                };
            }

            // Obtenir les informations de Cloudinary
            let cloudinaryInfo = null;
            try {
                cloudinaryInfo = await cloudinary.api.resource(image.publicId);
            } catch (cloudinaryError) {
                console.warn('⚠️ Impossible de récupérer les infos Cloudinary:', cloudinaryError.message);
            }

            return {
                success: true,
                image: {
                    ...image,
                    cloudinaryInfo: cloudinaryInfo ? {
                        format: cloudinaryInfo.format,
                        width: cloudinaryInfo.width,
                        height: cloudinaryInfo.height,
                        bytes: cloudinaryInfo.bytes,
                        createdAt: cloudinaryInfo.created_at,
                        resourceType: cloudinaryInfo.resource_type
                    } : null
                }
            };

        } catch (error) {
            console.error('❌ Erreur lors de la récupération des détails:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
   * Dupliquer les images d'une annonce vers une autre
   */
    static async duplicateAdImages(sourceAdId, targetAdId, userId) {
        try {
            const sourceImages = await prisma.listingImage.findMany({
                where: { id: sourceAdId },
                orderBy: { order: 'asc' }
            });

            if (sourceImages.length === 0) {
                return {
                    success: true,
                    message: 'Aucune image à dupliquer',
                    duplicatedCount: 0
                };
            }

            const duplicatedImages = [];

            for (const sourceImage of sourceImages) {
                try {
                    // Créer une copie dans Cloudinary
                    const duplicateResult = await cloudinary.uploader.upload(sourceImage.secureUrl, {
                        folder: 'adscity/listings',
                        public_id: `listing_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                        transformation: [
                            { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' }
                        ]
                    });

                    // Créer l'enregistrement en base
                    const newImage = await prisma.listingImage.create({
                        data: {
                            listingId: targetAdId,
                            userId: userId,
                            publicId: duplicateResult.public_id,
                            url: duplicateResult.url,
                            secureUrl: duplicateResult.secure_url,
                            filename: sourceImage.originalName,
                            format: duplicateResult.format,
                            width: duplicateResult.width,
                            height: duplicateResult.height,
                            bytes: duplicateResult.bytes,
                            isMain: sourceImage.isMain,
                            order: sourceImage.displayOrder,
                            uploadedAt: new Date()
                        }
                    });

                    duplicatedImages.push(newImage);

                } catch (imageError) {
                    console.error(`❌ Erreur duplication image ${sourceImage.id}:`, imageError);
                }
            }

            return {
                success: true,
                message: `${duplicatedImages.length} images dupliquées`,
                duplicatedCount: duplicatedImages.length,
                images: duplicatedImages
            };

        } catch (error) {
            console.error('❌ Erreur lors de la duplication des images:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
  * Vérifier la quota d'utilisation d'un utilisateur
  */
    static async checkUserQuota(userId, newFilesCount = 0) {
        try {
            const userStats = await this.getStorageStats(userId);

            if (!userStats.success) {
                return { withinQuota: false, error: 'Impossible de vérifier la quota' };
            }

            // Limites par défaut (peuvent être configurées par utilisateur)
            const MAX_IMAGES_PER_USER = 1000;
            const MAX_STORAGE_MB = 500; // 500MB par utilisateur

            const currentImages = userStats.stats.totalImages;
            const currentStorageMB = userStats.stats.totalSizeMB;

            const withinImageLimit = (currentImages + newFilesCount) <= MAX_IMAGES_PER_USER;
            const withinStorageLimit = currentStorageMB <= MAX_STORAGE_MB;

            return {
                withinQuota: withinImageLimit && withinStorageLimit,
                currentImages,
                maxImages: MAX_IMAGES_PER_USER,
                currentStorageMB,
                maxStorageMB: MAX_STORAGE_MB,
                canAddFiles: newFilesCount,
                warnings: [
                    !withinImageLimit ? `Limite d'images dépassée (${currentImages + newFilesCount}/${MAX_IMAGES_PER_USER})` : null,
                    !withinStorageLimit ? `Limite de stockage dépassée (${currentStorageMB}MB/${MAX_STORAGE_MB}MB)` : null
                ].filter(Boolean)
            };

        } catch (error) {
            console.error('❌ Erreur lors de la vérification de la quota:', error);
            return {
                withinQuota: false,
                error: error.message
            };
        }
    }
};

module.exports = FileManagerService;