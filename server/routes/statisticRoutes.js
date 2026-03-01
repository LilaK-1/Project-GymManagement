const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Equipment = require('../models/Equipment');
const Package = require('../models/Package');

// Thống kê Doanh Thu
router.get('/revenue', async (req, res) => {
    try {
        const currentYear = 2025;
        const startOfYearUTC = new Date(Date.UTC(currentYear, 0, 1));
        const startOfNextYearUTC = new Date(Date.UTC(currentYear + 1, 0, 1));

        const pipeline = [
            {
                $match: {
                    $or: [
                        { status: 'Completed' },
                        { status: 'completed' }
                    ],
                    purchaseDate: {
                        $gte: startOfYearUTC,
                        $lt: startOfNextYearUTC
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$purchaseDate" },
                    // Vì packagePrice đã là Number trong DB (theo ảnh Compass)
                    totalRevenue: { $sum: "$packagePrice" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ];

        const monthlyRevenue = await Order.aggregate(pipeline);

        // Chuẩn hóa dữ liệu để đảm bảo có đủ 12 tháng và định dạng tên tháng
        const formattedRevenueData = [];
        for (let i = 1; i <= 12; i++) {
            const monthData = monthlyRevenue.find(item => item._id === i);

            formattedRevenueData.push({
                // Định dạng thành chuỗi "Tháng X" cho trục X của Frontend
                month: `Tháng ${i}`,
                revenue: monthData ? monthData.totalRevenue : 0
            });
        }

        res.json(formattedRevenueData);

    } catch (error) {
        console.error("Lỗi khi thống kê doanh thu:", error);
        res.status(500).json({ message: 'Lỗi server khi thống kê doanh thu.' });
    }
});
// Thống kê thiết bị
router.get('/equipment-status', async (req, res) => {
    try {
        const pipeline = [
            // BƯỚC 1: Lọc các bản ghi có trạng thái (status) hợp lệ trước khi nhóm
            {
                $match: {
                    status: { $exists: true, $ne: null }
                }
            },

            // BƯỚC 2: Gom nhóm theo trạng thái (status)
            {
                $group: {
                    _id: "$status", // Gom nhóm theo trường status ban đầu
                    count: { $sum: 1 } // Đếm số lần xuất hiện
                }
            },

            // BƯỚC 3: Định hình lại kết quả (Project) cho Frontend
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    value: "$count" // Đổi tên 'count' thành 'value'
                }
            }
        ];

        const equipmentStatus = await Equipment.aggregate(pipeline);
        res.json(equipmentStatus);

    } catch (error) {
        console.error("Lỗi khi thống kê tình trạng thiết bị:", error);
        res.status(500).json({ message: 'Lỗi server khi thống kê thiết bị.' });
    }
});
// Thống kê gói tập
router.get('/packages', async (req, res) => {
    try {
        const pipeline = [
            // 1. Lọc các đơn hàng đã hoàn tất 
            {
                $match: {
                    $or: [
                        { status: 'Completed' },
                        { status: 'completed' }
                    ]
                }
            },

            // 2. Gom nhóm theo ID gói tập để đếm số lượng
            {
                $group: {
                    _id: "$package", // Gom nhóm theo trường package (ObjectId) trong Order
                    count: { $sum: 1 } // Đếm số lần xuất hiện
                }
            },

            // 3. Nối (Lookup) với Collection Package để lấy tên gói tập
            {
                $lookup: {
                    from: 'packages', // Tên collection của Gói tập (thường là số nhiều)
                    localField: '_id', // Trường ID gói tập từ bước $group
                    foreignField: '_id', // Trường ID của Package
                    as: 'packageDetails' // Đặt tên mảng kết quả
                }
            },

            // 4. Mở mảng packageDetails (do $lookup trả về mảng 1 phần tử)
            {
                $unwind: "$packageDetails"
            },

            // 5. Định hình lại kết quả cuối cùng
            {
                $project: {
                    _id: 0,
                    name: "$packageDetails.name", // Lấy tên gói tập
                    value: "$count" // Số lượng bán được
                }
            }
        ];

        const packageSales = await Order.aggregate(pipeline);

        // Kết quả sẽ là: [{ name: 'Premium', value: 10 }, { name: 'Basic', value: 5 }, ...]
        res.json(packageSales);

    } catch (error) {
        console.error("Lỗi khi thống kê gói tập phổ biến:", error);
        res.status(500).json({ message: 'Lỗi server khi thống kê gói tập.' });
    }
});

module.exports = router;