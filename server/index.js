const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const Trainer = require('./models/Trainer');
const Customer = require('./models/Customer');
const Statistics = require('./models/Statistics');
const app = express();
const statisticRoutes = require('./routes/statisticRoutes');
const packageRoutes = require('./routes/packageRoutes');
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gymdb';

// Middleware
app.use(cors()); // Cho phép React frontend gọi API
app.use(express.json()); // Cho phép Express xử lý JSON body
app.use('/uploads', express.static('uploads'));//upload ảnh
app.use('/api/statistics', statisticRoutes);
app.use('/api/packages', packageRoutes);
// 1. Kết nối MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB đã kết nối thành công.'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// 2. Định nghĩa Schema và Model (Mẫu)
const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    package: String,
});
//const Customer = mongoose.model('Customer', CustomerSchema);

// 3. Định nghĩa Routes (API Endpoints)
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Customer
app.post('/api/customers', async (req, res) => {
    const newCustomer = new Customer(req.body);
    try {
        const savedCustomer = await newCustomer.save();
        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//  UPDATE (Sửa khách hàng theo ID)
app.put('/api/customers/:id', async (req, res) => {
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id, // ID của khách hàng cần sửa (lấy từ URL)
            req.body,      // Dữ liệu mới để cập nhật
            { new: true, runValidators: true } // {new: true} trả về đối tượng đã được cập nhật
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
        }

        res.status(200).json(updatedCustomer);
    } catch (error) {
        // Lỗi: Validation fail (ví dụ: email đã tồn tại) hoặc ID không đúng định dạng
        res.status(400).json({ message: error.message });
    }
});

//  DELETE (Xóa khách hàng theo ID)
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

        if (!deletedCustomer) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
        }

        res.status(200).json({ message: 'Khách hàng đã được xóa thành công.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// GET: Lấy tất cả Huấn luyện viên
app.get('/trainers', async (req, res) => {
    try {
        const trainers = await Trainer.find();
        res.json(trainers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- CẤU HÌNH MULTER ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Lưu file vào thư mục 'uploads'
    },
    filename: function (req, file, cb) {
        // Đặt tên file là: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
// Khởi tạo Multer middlewar
const upload = multer({ storage: storage }).single('avatar');



// POST: Thêm Huấn luyện viên mới
app.post('/trainers', upload, async (req, res) => {
    try {
        const newTrainer = req.body;

        // Kiểm tra xem có file ảnh được tải lên không (thông qua Multer)
        if (req.file) {
            // Tạo URL công khai cho ảnh
            newTrainer.avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        } else {
            // Nếu không có file, đảm bảo avatarUrl không bị undefined nếu Frontend không gửi
            newTrainer.avatarUrl = newTrainer.avatarUrl || '';
        }

        const createdTrainer = await Trainer.create(newTrainer);
        res.status(201).json(createdTrainer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT: Cập nhật thông tin Huấn luyện viên
app.put('/trainers/:id', upload, async (req, res) => {
    try {
        const updateData = req.body;

        // Kiểm tra xem có file ảnh mới được tải lên không
        if (req.file) {
            // Tạo URL công khai cho ảnh mới
            updateData.avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }
        // Nếu không có req.file, Multer vẫn đảm bảo updateData.avatarUrl giữ nguyên giá trị cũ nếu người dùng không chọn file.

        const updatedTrainer = await Trainer.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        if (!updatedTrainer) {
            return res.status(404).json({ message: 'HLV không tìm thấy' });
        }
        res.json(updatedTrainer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Xóa Huấn luyện viên
app.delete('/trainers/:id', async (req, res) => {
    try {
        const deletedTrainer = await Trainer.findByIdAndDelete(req.params.id);
        if (!deletedTrainer) return res.status(404).json({ message: 'Trainer not found' });
        res.json({ message: 'Trainer deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Khởi động Server
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});