import React, { useState } from 'react';
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
    FormControl
} from '@mui/material';

const AddCustomerModal = ({
    open,
    handleClose,
    onAddCustomer,
    availablePackages
}) => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPackage: '',
        packagePrice: 0,
        durationMonths: 0
    });

    const calculatePrice = (packageId, duration) => {
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
            const newPackageId = name === 'currentPackage' ? value : formData.currentPackage;
            const newDuration = name === 'durationMonths' ? Number(value) : formData.durationMonths;
            const newPrice = calculatePrice(newPackageId, newDuration);
            newFormData = {
                ...newFormData,
                packagePrice: newPrice,
                durationMonths: newDuration
            };
        }

        setFormData(newFormData);
    };

    const handleSubmit = () => {
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.phone.trim()
        ) {
            alert('Vui lòng nhập Tên, Email và Số điện thoại tạo đầy đủ.');
            return;
        }

        if (formData.currentPackage) {
            if (Number(formData.durationMonths) <= 0) {
                alert('Vui lòng chọn Thời hạn (tháng) lớn hơn 0 cho gói tập đã đăng ký.');
                return;
            }
        }

        onAddCustomer(formData);

        setFormData({
            name: '',
            email: '',
            phone: '',
            currentPackage: '',
            packagePrice: 0,
            durationMonths: 0
        });

        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>➕ Thêm</DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Họ và Tên "
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            margin="dense"
                            name="email"
                            label="Email "
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            margin="dense"
                            name="phone"
                            label="Số Điện thoại "
                            type="tel"
                            fullWidth
                            variant="outlined"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth margin="dense" variant="outlined">
                            <InputLabel id="package-label">Gói tập đã đăng ký</InputLabel>

                            <Select
                                labelId="package-label"
                                name="currentPackage"
                                value={formData.currentPackage}
                                onChange={handleChange}
                                label="Gói tập đã đăng ký"
                            >
                                <MenuItem value="">
                                    <em>Không đăng ký ngay</em>
                                </MenuItem>

                                {availablePackages.map((pkg) => (
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

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            margin="dense"
                            name="packagePrice"
                            label="Giá gói tập (VNĐ)"
                            type="text"
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
                    HỦY
                </Button>

                <Button onClick={handleSubmit} variant="contained" color="primary">
                    THÊM
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddCustomerModal;
