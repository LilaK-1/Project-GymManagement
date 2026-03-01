const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
// @route POST /api/customers
// @desc Thêm khách hàng mới VÀ tự động tạo Order nếu có đăng ký gói tập
router.post('/', async (req, res) => {
    // Lấy tất cả các trường cần thiết từ Frontend (bao gồm cả các trường từ Customer Model)
    const { name, email, phone, currentPackage, packagePrice, durationMonths } = req.body;

    // Kiểm tra các trường bắt buộc theo Customer Model của bạn
    if (!name || !email || !phone) {
        // Vì bạn đặt email, name, phone là required: true trong Customer.js
        return res.status(400).json({ message: 'Tên, Email và Số điện thoại là bắt buộc.' });
    }

    try {
        // 1. TẠO KHÁCH HÀNG MỚI (Lưu vào Customer Model)
        const newCustomer = new Customer({
            name,
            email, // Thêm email
            phone,
            date,
            currentPackage: currentPackage || null,
            packagePrice: packagePrice || 0, // Lưu giá
        });

        await newCustomer.save();

        // 2. TẠO ORDER TỰ ĐỘNG CHO THỐNG KÊ 
        // Order chỉ được tạo nếu tất cả thông tin gói tập đều có
        if (currentPackage && packagePrice && durationMonths) {
            const newOrder = new Order({
                customer: newCustomer._id, // Tham chiếu ID khách hàng vừa tạo
                package: currentPackage,   // ID gói tập
                packagePrice: packagePrice, // Giá gói tập (cho thống kê Doanh thu)
                durationMonths: durationMonths,
                status: 'Completed', // Giả định thanh toán đã hoàn tất khi tạo Khách hàng
                purchaseDate: new Date()
            });

            await newOrder.save();
        }

        // Trả về thông tin khách hàng mới tạo
        res.status(201).json(newCustomer);

    } catch (error) {
        if (error.code === 11000) {
            // Lỗi trùng lặp (có thể do email hoặc phone - nếu bạn đặt unique cho phone)
            return res.status(409).json({ message: 'Email hoặc Số điện thoại đã tồn tại.' });
        }
        console.error("Lỗi khi thêm khách hàng:", error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

module.exports = router;