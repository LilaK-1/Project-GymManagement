import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';

const EditCustomerModal = ({
    open,
    handleClose,
    customerData,
    onUpdateCustomer,
    availablePackages
}) => {

    const [formData, setFormData] = useState({
        ...customerData,
        currentPackage: customerData?.currentPackage || '',
        durationMonths: Number(customerData?.durationMonths) || 0,
        packagePrice: Number(customerData?.packagePrice) || 0,
    });

    useEffect(() => {
        if (customerData) {
            setFormData({
                ...customerData,
                currentPackage: customerData.currentPackage || '',
                durationMonths: Number(customerData.durationMonths) || 0,
                packagePrice: Number(customerData.packagePrice) || 0,
            });
        }
    }, [customerData]);

    const calculatePrice = (packageId, duration) => {
        if (!availablePackages || availablePackages.length === 0) return 0;

        const pkg = availablePackages.find(p => p._id === packageId);
        const durationNumber = Number(duration);

        if (!pkg || durationNumber <= 0 || !pkg.pricePerMonth) {
            return 0;
        }

        return pkg.pricePerMonth * durationNumber;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newFormData = { ...formData, [name]: value };

        if (name === 'currentPackage' || name === 'durationMonths') {
            const newPackageId =
                name === 'currentPackage' ? value : formData.currentPackage;

            const newDuration =
                name === 'durationMonths' ? Number(value) : formData.durationMonths;

            const newPrice = calculatePrice(newPackageId, newDuration);

            newFormData = {
                ...newFormData,
                packagePrice: newPrice,
                durationMonths: newDuration,
            };
        }

        setFormData(newFormData);
    };

    const handleSubmit = () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            alert('Vui lòng nhập Tên và Email đầy đủ.');
            return;
        }

        if (formData.currentPackage) {
            if (Number(formData.durationMonths) <= 0) {
                alert('Thời hạn gói tập phải lớn hơn 0.');
                return;
            }
        }

        onUpdateCustomer(formData);
    };

    if (!customerData) return null;

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                ✏️ Chỉnh sửa Khách hàng: {customerData.name}
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            margin="dense"
                            name="name"
                            label="Họ và Tên"
                            fullWidth
                            variant="outlined"
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            margin="dense"
                            name="email"
                            label="Email"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={formData.email || ''}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            margin="dense"
                            name="phone"
                            label="Số Điện thoại"
                            fullWidth
                            variant="outlined"
                            value={formData.phone || ''}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="package-label">Gói tập đã đăng ký</InputLabel>

                            <Select
                                labelId="package-label"
                                name="currentPackage"
                                value={formData.currentPackage}
                                onChange={handleChange}
                                label="Gói tập đã đăng ký"
                            >
                                <MenuItem value="">
                                    <em>Không đăng ký</em>
                                </MenuItem>

                                {availablePackages?.map((pkg) => (
                                    <MenuItem key={pkg._id} value={pkg._id}>
                                        {pkg.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            margin="dense"
                            name="durationMonths"
                            label="Thời hạn (tháng)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={formData.durationMonths}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                            disabled={!formData.currentPackage}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            margin="dense"
                            name="packagePrice"
                            label="Giá gói tập (VNĐ)"
                            fullWidth
                            variant="outlined"
                            value={formData.packagePrice.toLocaleString('vi-VN')}
                            InputProps={{ readOnly: true }}
                            disabled={!formData.currentPackage}
                        />
                    </Grid>

                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="error">
                    Hủy
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Lưu thay đổi
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditCustomerModal;
