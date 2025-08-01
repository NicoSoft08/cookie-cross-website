const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

router.get('/ci', async (req, res) => {
    try {
        const citiesPath = path.join(__dirname, '../data/ci-cities.json');
        const citiesData = await fs.readFile(citiesPath, 'utf8');
        const cities = JSON.parse(citiesData);
       
        res.json({
            success: true,
            message: 'Villes récupérées avec succès',
            data: cities
        });
    } catch (error) {
        console.error('[GET CITIES ERROR]:', error);
        res.status(500).json({ success: false, message: "Erreur serveur", error: 'Internal Server Error' });
    }
});

module.exports = router;