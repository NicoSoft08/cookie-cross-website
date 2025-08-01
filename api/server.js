const app = require('./src/app');
const dotenv = require('dotenv');
const { main } = require('./src/scripts/seed');
const CleanupJob = require('./src/services/cleanup.job.service');
dotenv.config();



// Démarrer les tâches programmées
if (process.env.NODE_ENV !== 'test') {
    CleanupJob.startScheduledTasks();
}

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM reçu, arrêt des tâches programmées...');
    CleanupJob.stopScheduledTasks();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT reçu, arrêt des tâches programmées...');
    CleanupJob.stopScheduledTasks();
    process.exit(0);
});

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Welcome on AdsCity Official API');
});

app.listen(PORT, async () => {
    await main()
    console.log(`🚀 Serveur démarré sur le port http://localhost:${PORT}`);
    console.log(`📅 Tâches de nettoyage programmées activées`);
});
