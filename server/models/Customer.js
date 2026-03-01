const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    // Họ tên khách hàng
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // Email (dùng làm định danh duy nhất - Nếu bạn cần)
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // Số điện thoại
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    // Gói tập đang hoạt động
    currentPackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        default: null
    },
    // Giá gói tập cuối cùng đã đăng ký
    packagePrice: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

// Export Model
module.exports = mongoose.model('Customer', CustomerSchema);