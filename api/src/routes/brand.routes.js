// routes/brand.routes.js
const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");

router.get('/:slug', brandController.getBrandBySlug);
router.get("/cars", brandController.getCarBrands);
router.get("/phones", brandController.getPhoneBrands);

module.exports = router;
