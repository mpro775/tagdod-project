import React, { useMemo } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface PolicyEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  minHeight?: number;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'أدخل المحتوى...',
  error = false,
  helperText,
  minHeight = 300,
}) => {
  const theme = useTheme();

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'align',
    'link',
    'image',
    'color',
    'background',
    'font',
    'size',
  ];

  return (
    <Box>
      {label && (
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            color: error ? theme.palette.error.main : theme.palette.text.primary,
          }}
        >
          {label}
        </Typography>
      )}
      <Paper
        elevation={0}
        sx={{
          border: error ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          overflow: 'hidden',
          '& .quill': {
            backgroundColor: theme.palette.background.paper,
          },
          '& .ql-container': {
            minHeight,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            direction: 'rtl',
            '& .ql-editor': {
              minHeight,
              direction: 'rtl',
              textAlign: 'right',
            },
          },
          '& .ql-toolbar': {
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          },
          '& .ql-editor.ql-blank::before': {
            fontStyle: 'normal',
            color: theme.palette.text.disabled,
            right: '15px',
            left: 'auto',
          },
        }}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </Paper>
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            ml: 1.5,
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
