// components/layout/AdminLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    CssBaseline,
    Drawer,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '../Sidebar';


const drawerWidth = 280;

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeSection, setActiveSection] = useState('dashboard');

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    backgroundColor: 'white',
                    color: 'text.primary',
                    boxShadow: 1
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Admin Panel
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth
                            }
                        }}
                    >
                        <Sidebar
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                            onMobileClose={handleDrawerToggle}
                        />
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth
                            }
                        }}
                        open
                    >
                        <Sidebar
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                        />
                    </Drawer>
                )}
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Toolbar /> {/* Spacing for AppBar */}
                <Outlet context={{ activeSection, setActiveSection }} />
            </Box>
        </Box>
    );
};

export default AdminLayout;