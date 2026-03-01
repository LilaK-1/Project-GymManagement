import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, Button, Typography, Box
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import AddCustomerModal from '../components/AddCustomerModal';
import EditCustomerModal from '../components/EditCustomerModal';

// API Backend
const CUSTOMERS_API_URL = 'http://localhost:5000/api/customers';
const PACKAGES_API_URL = 'http://localhost:5000/api/packages';

// Mock Refresh Stats (tạm thời)
const mockStatsRefresh = () => {
    console.log("MOCK: Gọi hàm làm mới thống kê.");
};

const CustomerManagement = () => {

    const [customers, setCustomers] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [packages, setPackages] = useState([]);

    // Fetch gói tập
    const fetchPackages = async () => {
        try {
            const response = await axios.get(PACKAGES_API_URL);
            setPackages(response.data);
            console.log("Đã tải danh sách gói tập.");
        } catch (error) {
            console.error('Lỗi khi fetch gói tập:', error);
        }
    };

    // Tiện ích: lấy tên gói tập
    const getPackageName = (packageId) => {
        if (!packageId) return 'Chưa đăng ký';
        const pkg = packages.find(p => p._id === packageId);
        return pkg ? pkg.name : packageId;
    };

    // Fetch khách hàng
    const fetchCustomers = async () => {
        try {
            const response = await axios.get(CUSTOMERS_API_URL);
            setCustomers(response.data);
            console.log("Dữ liệu khách hàng đã được tải lại.");
        } catch (error) {
            console.error('Lỗi khi fetch data:', error);
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchPackages();
    }, []);

    // Thêm khách hàng
    const handleAddCustomer = async (newCustomerData) => {
        try {
            await axios.post(CUSTOMERS_API_URL, newCustomerData);
            await fetchCustomers();

            if (newCustomerData.currentPackage) {
                mockStatsRefresh();
            }

            setOpenAddModal(false);
        } catch (error) {
            console.error('Lỗi khi thêm khách hàng:', error);
            alert('Lỗi: Email có thể đã tồn tại hoặc thiếu trường bắt buộc.');
        }
    };

    // Xóa khách hàng
    const handleDelete = async (_id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;

        try {
            await axios.delete(`${CUSTOMERS_API_URL}/${_id}`);
            await fetchCustomers();
            mockStatsRefresh();
        } catch (error) {
            console.error('Lỗi khi xóa khách hàng:', error);
            alert('Lỗi khi xóa khách hàng. Vui lòng kiểm tra console.');
        }
    };

    // Mở modal sửa
    const handleOpenEdit = (customer) => {
        setSelectedCustomer(customer);
        setOpenEditModal(true);
    };

    // Đóng modal sửa
    const handleCloseEdit = () => {
        setOpenEditModal(false);
        setSelectedCustomer(null);
    };

    // Cập nhật khách hàng
    const handleUpdateCustomer = async (updatedData) => {
        try {
            await axios.put(`${CUSTOMERS_API_URL}/${updatedData._id}`, updatedData);

            console.log("Đang tải lại dữ liệu khách hàng...");
            await fetchCustomers();
            console.log("Dữ liệu khách hàng đã được tải lại thành công.");

            mockStatsRefresh();
            handleCloseEdit();
        } catch (error) {
            console.error('Lỗi khi cập nhật khách hàng:', error);
            alert('Lỗi khi cập nhật. Vui lòng kiểm tra dữ liệu và thử lại.');
        }
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    📚 Quản lý Khách hàng
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => setOpenAddModal(true)}
                >
                    + Thêm
                </Button>
            </Box>
            {/* Bảng dữ liệu */}
            <TableContainer component={Paper} className="custom-paper">
                <Table aria-label="customer table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Họ Tên</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Điện thoại</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Gói tập</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                Thao tác
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {customers.map((customer, index) => (
                            <TableRow key={customer._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{getPackageName(customer.currentPackage)}</TableCell>

                                <TableCell align="center">
                                    <Button
                                        onClick={() => handleOpenEdit(customer)}
                                        startIcon={<EditIcon />}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        Sửa
                                    </Button>

                                    <Button
                                        onClick={() => handleDelete(customer._id)}
                                        startIcon={<DeleteIcon />}
                                        color="error"
                                        size="small"
                                    >
                                        Xóa
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>

            {/* Modal thêm */}
            <AddCustomerModal
                open={openAddModal}
                handleClose={() => setOpenAddModal(false)}
                onAddCustomer={handleAddCustomer}
                availablePackages={packages}
            />

            {/* Modal chỉnh sửa */}
            <EditCustomerModal
                open={openEditModal}
                handleClose={handleCloseEdit}
                customerData={selectedCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                availablePackages={packages}
            />
        </Box>
    );
};

export default CustomerManagement;
