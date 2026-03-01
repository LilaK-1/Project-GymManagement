const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    purchaseDate: { type: Date, default: Date.now },
    packagePrice: { type: Number, required: true },
    status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
    durationMonths: { type: Number, required: true }
});

module.exports = mongoose.model('Order', OrderSchema);
