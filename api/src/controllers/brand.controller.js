const path = require('path');
const fs = require('fs');

exports.getBrandBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const filePath = path.join(__dirname, `../data/brands/${slug}.brand.json`);
        const rawData = fs.readFileSync(filePath, "utf-8");
        const brands = JSON.parse(rawData);

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const result = brands.map(brand => ({
            ...brand,
            icon: `${baseUrl}/public/images/brands/${slug}/${brand.icon}`
        }));

        res.json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error("[GET BRAND BY SLUG ERROR]", error);
        res.status(500).json({ success: false, message: "Erreur lors du chargement" });
    }
};

exports.getCarBrands = async (req, res) => {
    try {
        const filePath = path.join(__dirname, "../data/brands/cars.brand.json");
        const rawData = fs.readFileSync(filePath, "utf-8");
        const brands = JSON.parse(rawData);

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const result = brands.map(brand => ({
            ...brand,
            icon: `${baseUrl}/public/images/brands/cars/${brand.icon}`
        }));

        res.json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error("[CAR BRAND FETCH ERROR]", error);
        res.status(500).json({ success: false, message: "Erreur lors du chargement" });
    }
};

exports.getPhoneBrands = async (req, res) => {
    try {
        const filePath = path.join(__dirname, "../data/brands/phones.brand.json");
        const rawData = fs.readFileSync(filePath, "utf-8");
        const brands = JSON.parse(rawData);

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const result = brands.map(brand => ({
            ...brand,
            icon: `${baseUrl}/public/images/brands/phones/${brand.icon}`
        }));

        res.json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error("[PHONE BRAND FETCH ERROR]", error);
        res.status(500).json({ success: false, message: "Erreur lors du chargement" });
    }
};