import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

const API_URL_REVENUE = 'http://localhost:5000/api/statistics/revenue';
const API_URL_EQUIPMENT = 'http://localhost:5000/api/statistics/equipment-status';
const API_URL_PACKAGES = 'http://localhost:5000/api/statistics/packages';

// --- ĐỊNH DẠNG TIỀN ---
const formatVNDShort = value => typeof value === 'number' ? (value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)} Tr` : new Intl.NumberFormat('vi-VN').format(value)) : '';
const formatVNDFull = value => typeof value === 'number' ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value) : '';

// --- MÀU SẮC ---
const STATUS_COLORS = { 'Good': '#00C49F', 'Maintenance': '#FFBB28', 'Faulty': '#FF8042' };
const PACKAGE_COLORS = ['#C71585', '#97FFFF', '#A2B5CD', '#FF7F00', '#FF7F00'];

// --- COMPONENT CHARTS ---
//Doanh thu
const RevenueChart = ({ data }) => {
    //Hiển thị format VND
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <Paper sx={{ p: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{label}</Typography>
                    <Typography variant="body2" color="primary">Doanh thu: {formatVNDFull(payload[0].value)}</Typography>
                </Paper>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                {/* Lưới  */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    tick={{ angle: 0, textAnchor: 'end' }}
                    tickLine={true}
                    axisLine={true}
                />
                <YAxis domain={['dataMin', 'auto']} width={80} tickFormatter={formatVNDShort} />

                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={30} />
                <Bar dataKey="revenue" fill="#1976d2" name="Doanh thu" />
            </BarChart>
        </ResponsiveContainer>
    );
};

//Thiết bị
const EquipmentStatusChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={320}>
        <PieChart>
            <Pie
                data={data}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="45%"
                outerRadius={100}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return percent > 0.05 ? (
                        <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                        >
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                    ) : null;
                }}
            >
                {data.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.status] || '#AAAAAA'} />
                ))}
            </Pie>

            <Tooltip formatter={(value, name, props) => [`${value} thiết bị`, props.payload.status]} />

            <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ marginTop: 20 }}
            />
        </PieChart>
    </ResponsiveContainer>
);


//Gói tập
const PackageSalesChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={320}>
        <PieChart>
            <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                // Đặt biểu đồ center theo trục ngang
                cx="50%"
                // Tạo khoảng trống cho chú thích 
                cy="45%"
                outerRadius={100}

                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                        <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                        >
                            {`${(percent * 100).toFixed(1)}%`}
                        </text>
                    );
                }}
            >
                {/* Màu tương ứng với lát cắt */}
                {data.map((entry, index) => (
                    <Cell
                        key={index}
                        fill={PACKAGE_COLORS[index % PACKAGE_COLORS.length]}
                    />
                ))}
            </Pie>
            {/* Hiển thị tên khi hover */}
            <Tooltip
                formatter={(value, name, props) => [
                    `${value} lượt mua`,
                    props.payload.name,
                ]}
            />

            <Legend
                layout="horizontal"
                //Đặt chú thích dưới biểu đồ
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ marginTop: 20 }}
            />
        </PieChart>
    </ResponsiveContainer>
);


// --- COMPONENT STATISTICS ---
const StatisticsManagement = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [equipmentData, setEquipmentData] = useState([]);
    const [packageData, setPackageData] = useState([]);

    const [loadingRevenue, setLoadingRevenue] = useState(true);
    const [loadingEquipment, setLoadingEquipment] = useState(true);
    const [loadingPackage, setLoadingPackage] = useState(true);

    const [errorRevenue, setErrorRevenue] = useState(null);
    const [errorEquipment, setErrorEquipment] = useState(null);
    const [errorPackage, setErrorPackage] = useState(null);

    useEffect(() => {
        const fetchData = async (url, setData, setLoading, setError) => {
            try {
                setLoading(true);
                const res = await axios.get(url);
                setData(res.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Không thể tải dữ liệu.');
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData(API_URL_REVENUE, setRevenueData, setLoadingRevenue, setErrorRevenue);
        fetchData(API_URL_EQUIPMENT, setEquipmentData, setLoadingEquipment, setErrorEquipment);
        fetchData(API_URL_PACKAGES, setPackageData, setLoadingPackage, setErrorPackage);
    }, []);

    const renderChartContent = (loading, error, data, ChartComponent, emptyMessage) => {
        if (loading) return <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
        if (error) return <Alert severity="error">{error}</Alert>;
        if (!data || data.length === 0 || data.every(d => d.value === 0 || d.revenue === 0)) return <Alert severity="info">{emptyMessage}</Alert>;
        return <ChartComponent data={data} />;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 4 }}>📊 Quản lý Thống kê & Báo cáo</Typography>

            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>📈 Doanh thu (Năm {new Date().getFullYear()})</Typography>
                        {renderChartContent(loadingRevenue, errorRevenue, revenueData, RevenueChart, 'Chưa có giao dịch thanh toán nào trong năm nay.')}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>🛠️ Tình trạng Thiết bị</Typography>
                        {renderChartContent(loadingEquipment, errorEquipment, equipmentData, EquipmentStatusChart, 'Chưa có dữ liệu tình trạng thiết bị.')}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>🎁 Gói tập Phổ biến</Typography>
                        {renderChartContent(loadingPackage, errorPackage, packageData, PackageSalesChart, 'Chưa có gói tập nào được bán.')}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatisticsManagement;