import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Badge } from '@mui/material';
import { ShoppingCart, Favorite, Person, Menu } from '@mui/icons-material';
import { CurrencySelector } from './CurrencySelector';
import { useCurrency } from '../hooks/useCurrency';

interface HeaderProps {
  onMenuClick?: () => void;
  onCartClick?: () => void;
  onFavoritesClick?: () => void;
  onProfileClick?: () => void;
  cartItemsCount?: number;
  favoritesCount?: number;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onCartClick,
  onFavoritesClick,
  onProfileClick,
  cartItemsCount = 0,
  favoritesCount = 0,
  className = '',
}) => {
  const { getCurrentCurrencyInfo } = useCurrency();
  const currentCurrency = getCurrentCurrencyInfo();

  return (
    <AppBar position="static" className={`header ${className}`} sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Toolbar>
        {/* Mobile Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          sx={{ display: { xs: 'block', md: 'none' }, mr: 1 }}
        >
          <Menu />
        </IconButton>

        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            color: 'primary.main',
            cursor: 'pointer'
          }}
        >
          تاجدودو
        </Typography>

        {/* Currency Selector */}
        <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
          <CurrencySelector size="sm" showLabel={false} />
        </Box>

        {/* Current Currency Display (Mobile) */}
        <Box sx={{ display: { xs: 'block', sm: 'none' }, mr: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {currentCurrency.symbol}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Favorites */}
          <IconButton
            color="inherit"
            onClick={onFavoritesClick}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <Badge badgeContent={favoritesCount} color="error">
              <Favorite />
            </Badge>
          </IconButton>

          {/* Cart */}
          <IconButton
            color="inherit"
            onClick={onCartClick}
          >
            <Badge badgeContent={cartItemsCount} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton
            color="inherit"
            onClick={onProfileClick}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <Person />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
