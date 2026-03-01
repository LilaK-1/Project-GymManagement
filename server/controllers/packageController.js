const Package = require('../models/Package');
const getPackages = async (req, res) => {
    try {
        // Chỉ chọn các trường cần thiết (tên, giá/tháng, thời hạn)
        const packages = await Package.find().select('name pricePerMonth durationMonths');
        res.status(200).json(packages);
    } catch (error) {
        console.error('Lỗi khi lấy gói tập:', error);
        res.status(500).json({ message: 'Lỗi server khi truy vấn gói tập.' });
    }
};

module.exports = {
    getPackages,
};