// server/models/Trainer.js

const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
    // Họ tên
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // Email (Dùng làm định danh)
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
    // Ngày sinh (Dùng kiểu Date)
    dateOfBirth: {
        type: Date,
    },
    // Quê quán (Địa chỉ)
    address: {
        type: String,
        trim: true,
    },
    // Kinh nghiệm làm việc (có thể là một đoạn text dài)
    experience: {
        type: String,
        default: 'Chưa có kinh nghiệm',
    },
    // Avatar (URL ảnh hoặc đường dẫn file)
    avatarUrl: {
        type: String,
        default: 'https://i.imgur.com/example-default-avatar.png',
    },
    // Ngày tạo record
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Trainer', TrainerSchema);