const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class ClickService {

    /**
     * Enregistrer un clic sur une annonce
     */
    static async recordClick(listingId, userId = null, ipAddress = null, userAgent = null, location = {}) {
        try {
            // Vérifier si l'annonce existe
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                select: { id: true, userId: true }
            });

            if (!listing) {
                return { success: false, error: 'Annonce non trouvée' };
            }

            // Ne pas enregistrer les clics du propriétaire sur sa propre annonce
            if (userId && listing.userId === userId) {
                return { success: true, message: 'Clic du propriétaire ignoré' };
            }

            // Vérifier les clics en double (même IP dans les 5 dernières minutes)
            if (ipAddress) {
                const recentClick = await prisma.click.findFirst({
                    where: {
                        listingId,
                        ipAddress,
                        createdAt: {
                            gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
                        }
                    }
                });

                if (recentClick) {
                    return { success: true, message: 'Clic en double ignoré' };
                }
            }

            // Enregistrer le clic
            const click = await prisma.click.create({
                data: {
                    listingId,
                    userId,
                    ipAddress,
                    userAgent,
                    city: location.city,
                    country: location.country,
                    createdAt: new Date()
                }
            });

            // Mettre à jour les statistiques de l'annonce
            await this.updateListingStats(listingId, location.city);

            return {
                success: true,
                click,
                message: 'Clic enregistré avec succès'
            };

        } catch (error) {
            console.error('❌ Erreur enregistrement clic:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Mettre à jour les statistiques de l'annonce
     */
    static async updateListingStats(listingId, city = null) {
        try {
            const listing = await prisma.listing.findUnique({
                where: { id: listingId },
                select: {
                    clicks: true,
                    clicks_per_city: true,
                    clicks_history: true
                }
            });

            if (!listing) return;

            const today = new Date().toISOString().split('T')[0];

            const updatedClicksPerCity = { ...listing.clicks_per_city };
            const updatedClicksHistory = { ...listing.clicks_history };

            if (city) {
                updatedClicksPerCity[city] = (updatedClicksPerCity[city] || 0) + 1;
            }

            updatedClicksHistory[today] = (updatedClicksHistory[today] || 0) + 1;

            await prisma.listing.update({
                where: { id: listingId },
                data: {
                    clicks: listing.clicks + 1,
                    clicks_per_city: updatedClicksPerCity,
                    clicks_history: updatedClicksHistory,
                    updatedAt: new Date()
                }
            });

        } catch (error) {
            console.error('❌ Erreur mise à jour stats:', error);
        }
    }

    /**
     * Obtenir les statistiques de clics pour une annonce
     */
    static async getClickStats(listingId, period = 30) {
        try {
            const [listing, clicks] = await Promise.all([
                prisma.listing.findUnique({
                    where: { id: listingId },
                    select: {
                        clicks: true,
                        clicks_per_city: true,
                        clicks_history: true,
                        views: true
                    }
                }),
                prisma.click.findMany({
                    where: {
                        listingId,
                        createdAt: {
                            gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000) // Période en jours
                        }
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            ]);

            if (!listing) {
                return { success: false, error: 'Annonce non trouvée' };
            }

            // Calculer les statistiques pour la période
            const periodStats = this.calculatePeriodStats(clicks, period);

            // Calculer le CTR (Click Through Rate)
            const ctr = listing.views > 0 ? ((listing.clicks / listing.views) * 100).toFixed(2) : 0;

            // Analyser les clics par ville
            const clicksByCity = {};
            clicks.forEach(click => {
                if (click.city) {
                    clicksByCity[click.city] = (clicksByCity[click.city] || 0) + 1;
                }
            });

            // Analyser les clics par jour
            const clicksByDay = {};
            clicks.forEach(click => {
                const day = click.createdAt.toISOString().split('T')[0];
                clicksByDay[day] = (clicksByDay[day] || 0) + 1;
            });

            // Top des villes
            const topCities = Object.entries(clicksByCity)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([city, count]) => ({ city, count }));

            return {
                success: true,
                stats: {
                    total: {
                        clicks: listing.clicks,
                        views: listing.views,
                        ctr: parseFloat(ctr)
                    },
                    period: {
                        days: period,
                        clicks: clicks.length,
                        uniqueUsers: new Set(clicks.filter(c => c.userId).map(c => c.userId)).size,
                        anonymousClicks: clicks.filter(c => !c.userId).length
                    },
                    geographic: {
                        clicksByCity: listing.clicks_per_city,
                        topCities
                    },
                    timeline: {
                        clicksHistory: listing.clicks_history,
                        recentClicksByDay: clicksByDay
                    },
                    detailed: periodStats
                }
            };

        } catch (error) {
            console.error('❌ Erreur récupération stats clics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Calculer les statistiques pour une période donnée
     */
    static calculatePeriodStats(clicks, period) {
        const now = new Date();
        const periods = {
            last7Days: clicks.filter(c =>
                (now - c.createdAt) <= 7 * 24 * 60 * 60 * 1000
            ).length,
            last15Days: clicks.filter(c =>
                (now - c.createdAt) <= 15 * 24 * 60 * 60 * 1000
            ).length,
            last30Days: clicks.filter(c =>
                (now - c.createdAt) <= 30 * 24 * 60 * 60 * 1000
            ).length
        };

        // Clics par heure de la journée
        const clicksByHour = {};
        for (let i = 0; i < 24; i++) {
            clicksByHour[i] = 0;
        }

        clicks.forEach(click => {
            const hour = click.createdAt.getHours();
            clicksByHour[hour]++;
        });

        // Clics par jour de la semaine
        const clicksByWeekday = {};
        const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        weekdays.forEach((day, index) => {
            clicksByWeekday[day] = clicks.filter(c => c.createdAt.getDay() === index).length;
        });

        return {
            periods,
            patterns: {
                clicksByHour,
                clicksByWeekday
            }
        };
    }

    /**
     * Obtenir les clics récents pour une annonce
     */
    static async getRecentClicks(listingId, limit = 50) {
        try {
            const clicks = await prisma.click.findMany({
                where: { listingId },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });

            return {
                success: true,
                clicks: clicks.map(click => ({
                    id: click.id,
                    user: click.user,
                    city: click.city,
                    country: click.country,
                    createdAt: click.createdAt,
                    isAnonymous: !click.userId
                }))
            };

        } catch (error) {
            console.error('❌ Erreur récupération clics récents:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Nettoyer les anciens clics (plus de 90 jours)
     */
    static async cleanupOldClicks() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);

            const result = await prisma.click.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate
                    }
                }
            });

            console.log(`🧹 ${result.count} anciens clics supprimés`);

            return {
                success: true,
                deletedCount: result.count
            };

        } catch (error) {
            console.error('❌ Erreur nettoyage clics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtenir les statistiques globales de clics
     */
    static async getGlobalClickStats(userId) {
        try {
            const userListings = await prisma.listing.findMany({
                where: { userId },
                select: { id: true, title: true, clicks: true, views: true }
            });

            const listingIds = userListings.map(l => l.id);

            const [totalClicks, recentClicks] = await Promise.all([
                prisma.click.count({
                    where: { listingId: { in: listingIds } }
                }),
                prisma.click.count({
                    where: {
                        listingId: { in: listingIds },
                        createdAt: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
                        }
                    }
                })
            ]);

            const totalViews = userListings.reduce((sum, listing) => sum + listing.views, 0);
            const totalListingClicks = userListings.reduce((sum, listing) => sum + listing.clicks, 0);
            const globalCTR = totalViews > 0 ? ((totalListingClicks / totalViews) * 100).toFixed(2) : 0;

            return {
                success: true,
                stats: {
                    totalListings: userListings.length,
                    totalClicks: totalListingClicks,
                    totalViews,
                    globalCTR: parseFloat(globalCTR),
                    recentClicks: recentClicks,
                    averageClicksPerListing: userListings.length > 0 ?
                        (totalListingClicks / userListings.length).toFixed(1) : 0,
                    topPerformingListings: userListings
                        .sort((a, b) => b.clicks - a.clicks)
                        .slice(0, 5)
                        .map(l => ({
                            id: l.id,
                            title: l.title,
                            clicks: l.clicks,
                            views: l.views,
                            ctr: l.views > 0 ? ((l.clicks / l.views) * 100).toFixed(2) : 0
                        }))
                }
            };

        } catch (error) {
            console.error('❌ Erreur stats globales clics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
  * Calculer les tendances des clics
  */
    static calculateTrends(clicks, period) {
        const now = new Date();
        const trends = {};

        // Clics par jour
        const clicksByDay = {};
        for (let i = 0; i < period; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            clicksByDay[dateKey] = 0;
        }

        clicks.forEach(click => {
            const dateKey = click.createdAt.toISOString().split('T')[0];
            if (clicksByDay.hasOwnProperty(dateKey)) {
                clicksByDay[dateKey]++;
            }
        });

        trends.daily = clicksByDay;

        // Clics par heure (dernières 24h)
        const last24h = clicks.filter(c =>
            (now - c.createdAt) <= 24 * 60 * 60 * 1000
        );

        const clicksByHour = {};
        for (let i = 0; i < 24; i++) {
            clicksByHour[i] = 0;
        }

        last24h.forEach(click => {
            const hour = click.createdAt.getHours();
            clicksByHour[hour]++;
        });

        trends.hourly = clicksByHour;

        // Top des annonces
        const clicksByListing = {};
        clicks.forEach(click => {
            const key = `${click.listingId}|${click.listing.title}`;
            clicksByListing[key] = (clicksByListing[key] || 0) + 1;
        });

        trends.topListings = Object.entries(clicksByListing)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([key, count]) => {
                const [id, title] = key.split('|');
                return { id, title, clicks: count };
            });

        return trends;
    }

    /**
   * Générer les données CSV
   */
    static generateCSV(listings) {
        const headers = [
            'Annonce ID',
            'Titre',
            'Total Clics',
            'Total Vues',
            'CTR (%)',
            'Date Clic',
            'Utilisateur',
            'Ville',
            'Pays'
        ];

        let csvContent = headers.join(',') + '\n';

        listings.forEach(listing => {
            const ctr = listing.views > 0 ? ((listing.clicks / listing.views) * 100).toFixed(2) : 0;

            if (listing.clicks.length === 0) {
                // Ligne pour l'annonce sans clics
                csvContent += [
                    listing.id,
                    `"${listing.title}"`,
                    listing.clicks,
                    listing.views,
                    ctr,
                    '',
                    '',
                    '',
                    ''
                ].join(',') + '\n';
            } else {
                // Une ligne par clic
                listing.clicks.forEach(click => {
                    const userName = click.user ?
                        `${click.user.firstName} ${click.user.lastName}` :
                        'Anonyme';

                    csvContent += [
                        listing.id,
                        `"${listing.title}"`,
                        listing.clicks,
                        listing.views,
                        ctr,
                        click.createdAt.toISOString(),
                        `"${userName}"`,
                        click.city || '',
                        click.country || ''
                    ].join(',') + '\n';
                });
            }
        });

        return csvContent;
    }
}

module.exports = ClickService;
