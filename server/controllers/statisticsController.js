import Order from '../models/Order.js';

// Lấy Doanh thu theo tháng trong năm hiện tại
export const getRevenueStats = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        // Pipeline tổng hợp của MongoDB (Aggregation Pipeline)
        const revenue = await Order.aggregate([
            {
                // 1. Chỉ lấy các đơn hàng đã hoàn tất (Completed) trong năm hiện tại
                $match: {
                    status: 'Completed',
                    purchaseDate: {
                        $gte: new Date(`${currentYear}-01-01`), // Bắt đầu năm
                        $lt: new Date(`${currentYear + 1}-01-01`) // Kết thúc năm
                    }
                }
            },
            {
                // 2. Nhóm theo tháng và tính tổng doanh thu
                $group: {
                    _id: { $month: "$purchaseDate" }, // Group theo số tháng (1-12)
                    totalRevenue: { $sum: "$packagePrice" }
                }
            },
            {
                // 3. Sắp xếp theo thứ tự tháng tăng dần
                $sort: { _id: 1 }
            },
            {
                // 4. Định hình lại output để dễ đọc hơn (tên trường phù hợp với Frontend)
                $project: {
                    _id: 0, // Bỏ trường _id mặc định
                    month: "$_id", // Đổi tên _id thành month
                    revenue: "$totalRevenue"
                }
            }
        ]);

        // 5. Chuẩn hóa dữ liệu cho 12 tháng (đảm bảo tháng không có doanh thu vẫn xuất hiện)
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            revenue: 0,
        }));

        revenue.forEach(item => {
            // Cập nhật doanh thu cho tháng tương ứng (item.month là số tháng 1-12)
            monthlyRevenue[item.month - 1].revenue = item.revenue;
        });

        // Định dạng lại tên tháng từ số sang chữ 'Tháng 1', 'Tháng 2', v.v.
        const formattedRevenue = monthlyRevenue.map(item => ({
            month: `Tháng ${item.month}`,
            revenue: item.revenue
        }));

        res.status(200).json(formattedRevenue);

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        res.status(500).json({ message: 'Không thể tải dữ liệu thống kê doanh thu.' });
    }
};