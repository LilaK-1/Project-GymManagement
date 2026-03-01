const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Good', 'Maintenance', 'Faulty'],
        default: 'Good',
        required: true
    },
    lastMaintenanceDate: {
        type: Date,
        default: Date.now
    },
    location: { // Vị trí (ví dụ: Tầng 1, Tầng 2)
        type: String,
        trim: true
    },
    purchaseDate: {
        type: Date,
    },
    serialNumber: {
        type: String,
        unique: true,
        sparse: true // Cho phép nhiều document không có serialNumber
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Equipment', EquipmentSchema, 'equipments');