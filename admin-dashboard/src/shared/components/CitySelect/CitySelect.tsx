import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
} from '@mui/material';
import { YEMENI_CITIES, getCityEmoji, DEFAULT_CITY } from '@/shared/constants/yemeni-cities';

interface CitySelectProps extends Omit<SelectProps, 'onChange'> {
  value?: string;
  onChange?: (city: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

export const CitySelect: React.FC<CitySelectProps> = ({
  value,
  onChange,
  error,
  helperText,
  required = false,
  label = 'المدينة',
  ...selectProps
}) => {
  const handleChange = (event: any) => {
    onChange?.(event.target.value);
  };

  return (
    <FormControl fullWidth error={error} required={required}>
      <InputLabel id="city-select-label">{label}</InputLabel>
      <Select
        labelId="city-select-label"
        value={value || DEFAULT_CITY}
        onChange={handleChange}
        label={label}
        {...selectProps}
      >
        {YEMENI_CITIES.map((city) => (
          <MenuItem key={city} value={city}>
            <span style={{ marginLeft: '8px' }}>{getCityEmoji(city)}</span>
            {city}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

