// src/layout/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
const drawerWidth = 240;

const DashboardLayout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* --- Thanh Header (Top Bar) --- */}
            <Box
                component="header"
                sx={{
                    width: `calc(92% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    position: 'fixed',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'white',
                    boxShadow: 3,
                    p: 2
                }}
            >
                <h3 style={{ margin: 2 }}>Chào mừng, Admin!</h3>
            </Box>

            {/* --- Sidebar (Thanh Điều Hướng) --- */}
            <Sidebar />
            {/* --- MainContent --- */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: '#f4f6f8',
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` }
                }}
                className="main-content-box"
            >
                {/* Toolbar là một khoảng đệm để tránh nội dung bị che bởi Header/Topbar */}
                <Toolbar />
                <Toolbar /> {/* Thêm một Toolbar nữa để bù đắp cho Header cố định */}

                {/* Outlet hiển thị nội dung của Route con (các trang Quản lý) */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayout;