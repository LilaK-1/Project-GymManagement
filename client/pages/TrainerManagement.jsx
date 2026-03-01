import React, { useState, useEffect } from "react";
import {
    Box, Typography, Button, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
    Modal, TextField, IconButton, Snackbar, Alert
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_URL = 'http://localhost:5000/trainers';

// Style cho Modal 
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const TrainerManagement = () => {
    // 1. KHAI BÁO STATE VÀ HOOKS
    const [trainers, setTrainers] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [currentTrainer, setCurrentTrainer] = useState(null);
    const [openImageModal, setOpenImageModal] = useState(false); // State để mở/đóng modal ảnh
    const [selectedImageUrl, setSelectedImageUrl] = useState(''); // State để lưu URL ảnh cần phóng to
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', dateOfBirth: '', address: '', experience: '', avatarUrl: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState({}); // State mới cho validation

    // --- 2. LOGIC TẢI DỮ LIỆU & FILE ---

    const fetchTrainers = async () => {
        try {
            const response = await axios.get(API_URL);
            setTrainers(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách", error);
            setSnackbar({ open: true, message: 'Lỗi khi tải dữ liệu HLV', severity: 'error' });
        }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);
    const handleFormChange = (e) => {
        // Xóa lỗi khi người dùng bắt đầu nhập lại
        setValidationErrors({ ...validationErrors, [e.target.name]: '' });
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleFileChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };
    const handleEditOpen = (trainer) => {
        setCurrentTrainer(trainer);
        const dob = trainer.dateOfBirth ? trainer.dateOfBirth.split('T')[0] : '';
        setFormData({
            name: trainer.name,
            email: trainer.email,
            phone: trainer.phone,
            dateOfBirth: dob,
            address: trainer.address,
            experience: trainer.experience, // Giữ nguyên giá trị cũ
            avatarUrl: trainer.avatarUrl
        });
        setAvatarFile(null); // Reset file khi mở modal sửa
        setValidationErrors({}); // Reset lỗi
        setOpenEditModal(true);
    };
    const handleAddOpen = () => {
        setFormData({
            name: '', email: '', phone: '', dateOfBirth: '', address: '', experience: '', avatarUrl: ''
        });
        setAvatarFile(null); // Reset file
        setValidationErrors({}); // Reset lỗi
        setOpenAddModal(true);
    };
    // --- 3. CRUD LOGIC VÀ VALIDATION ---
    const validateForm = () => {
        const errors = {};
        const phoneRegex = /^\d{10}$/; //sdt phải có 10 số

        if (!formData.name.trim()) errors.name = 'Họ Tên là bắt buộc.';
        if (!formData.email.trim()) errors.email = 'Email là bắt buộc.';

        if (!formData.phone.trim()) {
            errors.phone = 'Số điện thoại là bắt buộc.';
        } else if (!phoneRegex.test(formData.phone)) {
            errors.phone = 'Số điện thoại phải gồm 10 chữ số.';
        }

        // Kinh nghiệm nên là số
        if (formData.experience && isNaN(Number(formData.experience))) {
            errors.experience = 'Kinh nghiệm phải là số.';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }
    // THÊM Huấn luyện viên
    const handleAddSubmit = async () => {
        if (!validateForm()) {
            setSnackbar({ open: true, message: 'Vui lòng điền đầy đủ và chính xác các trường bắt buộc.', severity: 'warning' });
            return;
        }

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            dataToSend.append(key, formData[key]);
        });

        if (avatarFile) {
            dataToSend.append('avatar', avatarFile);
        }

        try {
            await axios.post(API_URL, dataToSend);
            setSnackbar({ open: true, message: 'Thêm Huấn luyện viên thành công!', severity: 'success' });
            setAvatarFile(null);
            fetchTrainers();
            setOpenAddModal(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi thêm: Email đã tồn tại hoặc lỗi server.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };
    // CẬP NHẬT Huấn luyện viên
    const handleEditSubmit = async () => {
        if (!validateForm()) {
            setSnackbar({ open: true, message: 'Vui lòng điền đầy đủ và chính xác các trường bắt buộc.', severity: 'warning' });
            return;
        }

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            // Không gửi lại email nếu không thay đổi (giữ nguyên quy tắc backend)
            if (key !== 'email' || formData[key] !== currentTrainer.email) {
                dataToSend.append(key, formData[key]);
            }
        });

        if (avatarFile) {
            dataToSend.append('avatar', avatarFile);
        }

        try {
            await axios.put(`${API_URL}/${currentTrainer._id}`, dataToSend);
            setSnackbar({ open: true, message: 'Cập nhật thành công!', severity: 'success' });
            setAvatarFile(null);
            fetchTrainers();
            setOpenEditModal(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };
    // XÓA Huấn luyện viên
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa Huấn luyện viên này?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setSnackbar({ open: true, message: 'Xóa thành công!', severity: 'success' });
                fetchTrainers();
            } catch (error) {
                setSnackbar({ open: true, message: 'Lỗi khi xóa.', severity: 'error' });
            }
        }
    };
    //PHÓNG TO AVATAR
    const handleAvatarClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl); // Lưu URL của ảnh được click
        setOpenImageModal(true);       // Mở modal ảnh
    };
    // --- 4. RENDER UI ---

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            {/* Header và Nút THÊM */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Quản lý Huấn luyện viên
                </Typography>
                <Button variant="contained" size="small" onClick={handleAddOpen}>
                    + Thêm Huấn luyện viên Mới
                </Button>
            </Box>

            {/* BẢNG DỮ LIỆU */}
            <TableContainer component={Paper} className="custom-paper">
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Avatar</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Họ Tên</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Điện thoại</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Kinh nghiệm</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trainers.map((trainer, index) => (
                            <TableRow key={trainer._id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Box
                                        onClick={() => handleAvatarClick(trainer.avatarUrl || 'placeholder_url')}
                                        //hiển thị con trỏ khi trỏ vào avatar
                                        sx={{ cursor: 'pointer', display: 'inline-block', borderRadius: '50%', overflow: 'hidden' }}
                                    >
                                        <img
                                            src={trainer.avatarUrl || 'placeholder_url'}
                                            alt={trainer.name}
                                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell>{trainer.name}</TableCell>
                                <TableCell>{trainer.email}</TableCell>
                                <TableCell>{trainer.phone}</TableCell>
                                <TableCell>{trainer.experience} tháng</TableCell> {/* Hiển thị đơn vị */}
                                <TableCell align="center">
                                    <IconButton size="small" color="primary" onClick={() => handleEditOpen(trainer)}>
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(trainer._id)}>
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- MODAL THÊM (ADD) --- */}
            <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" mb={3}>
                        Thêm
                    </Typography>

                    <TextField fullWidth margin="normal" label="Họ Tên" name="name" value={formData.name} onChange={handleFormChange} required
                        error={!!validationErrors.name} helperText={validationErrors.name} />

                    <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required
                        error={!!validationErrors.email} helperText={validationErrors.email} />

                    <TextField fullWidth margin="normal" label="Số điện thoại" name="phone" value={formData.phone} onChange={handleFormChange} required
                        error={!!validationErrors.phone} helperText={validationErrors.phone} />

                    <TextField fullWidth margin="normal" label="Ngày sinh" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />

                    <TextField fullWidth margin="normal" label="Quê quán" name="address" value={formData.address} onChange={handleFormChange} />

                    {/* INPUT KINH NGHIỆM ĐÃ SỬA */}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Kinh nghiệm"
                        name="experience"
                        type="number"
                        value={formData.experience}
                        onChange={handleFormChange}
                        InputProps={{
                            endAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', whiteSpace: 'nowrap' }}>tháng </Typography>,
                            inputProps: { min: 0 }
                        }}
                        error={!!validationErrors.experience}
                        helperText={validationErrors.experience}
                    />

                    {/* INPUT TẢI FILE ĐÃ SỬA */}
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Chọn Ảnh đại diện
                        </Typography>
                        <input
                            type="file"
                            name="avatarFile"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {avatarFile && <Typography variant="caption" display="block">Đã chọn: {avatarFile.name}</Typography>}
                    </Box>

                    <Button variant="contained" onClick={handleAddSubmit} sx={{ mt: 3, mr: 2 }}>Thêm</Button>
                    <Button onClick={() => setOpenAddModal(false)} sx={{ mt: 3 }}>Hủy</Button>
                </Box>
            </Modal>

            {/* --- MODAL SỬA (EDIT) ---  */}
            <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" mb={3}>
                        Cập nhật Huấn luyện viên: {currentTrainer?.name}
                    </Typography>

                    <TextField fullWidth margin="normal" label="Họ Tên" name="name" value={formData.name} onChange={handleFormChange} required
                        error={!!validationErrors.name} helperText={validationErrors.name} />

                    <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required disabled />

                    <TextField fullWidth margin="normal" label="Số điện thoại" name="phone" value={formData.phone} onChange={handleFormChange} required
                        error={!!validationErrors.phone} helperText={validationErrors.phone} />

                    <TextField fullWidth margin="normal" label="Ngày sinh" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleFormChange} InputLabelProps={{ shrink: true }} />

                    <TextField fullWidth margin="normal" label="Quê quán" name="address" value={formData.address} onChange={handleFormChange} />

                    {/* INPUT KINH NGHIỆM*/}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Kinh nghiệm"
                        name="experience"
                        type="number"
                        value={formData.experience}
                        onChange={handleFormChange}
                        InputProps={{
                            endAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', whiteSpace: 'nowrap' }}>tháng </Typography>,
                            inputProps: { min: 0 }
                        }}
                        error={!!validationErrors.experience}
                        helperText={validationErrors.experience}
                    />

                    {/* INPUT TẢI FILE ẢNH */}
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Chọn Ảnh đại diện MỚI
                        </Typography>
                        <input
                            type="file"
                            name="avatarFile"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {avatarFile && <Typography variant="caption" display="block">Đã chọn: {avatarFile.name}</Typography>}
                    </Box>

                    <Button variant="contained" onClick={handleEditSubmit} sx={{ mt: 3, mr: 2 }}>Lưu thay đổi</Button>
                    <Button onClick={() => setOpenEditModal(false)} sx={{ mt: 3 }}>Hủy</Button>
                </Box>
            </Modal>
            {/* --- MODAL HIỂN THỊ ẢNH PHÓNG TO --- */}
            <Modal
                open={openImageModal}
                onClose={() => setOpenImageModal(false)}
                aria-labelledby="image-modal-title"
                aria-describedby="image-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '90vw', // Giới hạn chiều rộng tối đa của ảnh
                    maxHeight: '90vh', // Giới hạn chiều cao tối đa của ảnh
                    outline: 'none', // Xóa outline khi focus
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <img
                        src={selectedImageUrl}
                        alt="Ảnh phóng to"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain' // Đảm bảo ảnh hiển thị đầy đủ trong box
                        }}
                    />
                </Box>
            </Modal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TrainerManagement;