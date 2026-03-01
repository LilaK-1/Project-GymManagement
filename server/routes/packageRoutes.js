const express = require('express');
const router = express.Router();
const { getPackages } = require('../controllers/packageController');

// Tuyến đường cho việc lấy tất cả gói tập
router.get('/', getPackages);

module.exports = router;