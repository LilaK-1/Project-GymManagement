import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/PeopleAlt';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import StarIcon from '@mui/icons-material/Star';
import BuildIcon from '@mui/icons-material/Build';
import { PeopleAltTwoTone } from '@mui/icons-material';
const drawerWidth = 240;

const menuItems = [
    { text: 'Khách hàng', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Huấn luyện viên', icon: <FitnessCenterIcon />, path: '/trainers' },
    { text: 'Thống kê', icon: <StarIcon />, path: '/statistics' },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <Drawer
            sx={{ width: drawerWidth, flexShrink: 0 }}
            variant="permanent"
            anchor="left"
            classes={{ paper: 'dashboard-sidebar-paper' }}
        >
            <Link to="/" style={{ textDecoration: 'none' }}>
                <Toolbar>
                    <Typography component="div" className="sidebar-logo">
                        🏋️ PAGE ADMIN
                    </Typography>
                </Toolbar>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            </Link >

            <List>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    // Tạo chuỗi class động cho item
                    const itemClasses = `sidebar-item-button ${isActive ? 'sidebar-item-active' : ''}`;

                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                className={itemClasses}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 'bold' : 'normal' }} />
                            </ListItemButton>

                        </ListItem>
                    );
                })}
            </List>
            <Divider sx={{ borderColor: 'rgba(243, 112, 5, 0.1)' }} />
        </Drawer >
    );
};
export default Sidebar;