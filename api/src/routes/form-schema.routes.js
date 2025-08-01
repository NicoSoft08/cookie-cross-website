const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    console.log(slug)

    if (!slug) {
        return res.status(400).json({
            success: false,
            message: 'Le paramètre "slug" est requis'
        });
    }

    try {
        const formSchemaPath = path.join(__dirname, `../data/forms/${slug}.form.json`);
        const formSchemaData = await fs.readFile(formSchemaPath, 'utf8');
        const parsed = JSON.parse(formSchemaData);

        // On récupère le champ correspondant à la sous-catégorie
        if (parsed) {
            return res.status(200).json({
                success: true,
                message: 'Formulaire du "paramètre" récupéré avec succès',
                fields: parsed
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Aucun formaulaire n'a pu etre chargé",
                fields: null,
            });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des champs du formulaire:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des champs du formulaire',
            error: error.message
        });
    }
});

module.exports = router;