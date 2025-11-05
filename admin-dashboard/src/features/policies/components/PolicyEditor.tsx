import React, { useMemo } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

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
  placeholder,
  error = false,
  helperText,
  minHeight = 300,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('policies');
  const { isMobile, isTablet } = useBreakpoint();
  
  // استخدام الترجمة للنص الافتراضي إذا لم يتم تمرير placeholder
  const translatedPlaceholder = placeholder || t('editor.placeholder');
  const translatedLabel = label || t('editor.label');

  const modules = useMemo(
    () => ({
      toolbar: isMobile
        ? [
            // شريط أدوات مبسط للهواتف
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ]
        : isTablet
        ? [
            // شريط أدوات متوسط للأجهزة اللوحية
            [{ header: [1, 2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
            [{ color: [] }, { background: [] }],
          ]
        : [
            // شريط أدوات كامل للأجهزة المكتبية
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
    [isMobile, isTablet]
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

  // حساب minHeight متجاوب
  const responsiveMinHeight = isMobile ? Math.max(minHeight * 0.7, 200) : isTablet ? Math.max(minHeight * 0.85, 250) : minHeight;

  return (
    <Box>
      {translatedLabel && (
        <Typography
          variant={isMobile ? 'body2' : 'subtitle2'}
          sx={{
            mb: 1,
            color: error ? theme.palette.error.main : theme.palette.text.primary,
            fontWeight: 500,
          }}
        >
          {translatedLabel}
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
            minHeight: responsiveMinHeight,
            fontFamily: theme.typography.fontFamily,
            fontSize: isMobile ? theme.typography.body2.fontSize : theme.typography.body1.fontSize,
            direction: 'rtl',
            '& .ql-editor': {
              minHeight: responsiveMinHeight,
              direction: 'rtl',
              textAlign: 'right',
              padding: isMobile ? '8px 12px' : '12px 15px',
              color: theme.palette.text.primary,
              '&.ql-blank::before': {
                fontStyle: 'normal',
                color: theme.palette.text.disabled,
                right: isMobile ? '12px' : '15px',
                left: 'auto',
              },
            },
          },
          '& .ql-toolbar': {
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
            padding: isMobile ? '8px' : '12px',
            '& .ql-formats': {
              marginRight: isMobile ? '4px' : '8px',
            },
            '& button': {
              width: isMobile ? '28px' : '32px',
              height: isMobile ? '28px' : '32px',
              padding: isMobile ? '4px' : '6px',
              '& svg': {
                width: isMobile ? '16px' : '18px',
                height: isMobile ? '16px' : '18px',
              },
              '&:hover, &.ql-active': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.08)',
              },
            },
            '& .ql-stroke': {
              stroke: theme.palette.text.primary,
            },
            '& .ql-fill': {
              fill: theme.palette.text.primary,
            },
            '& .ql-picker-label': {
              color: theme.palette.text.primary,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            },
            '& .ql-picker-options': {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              boxShadow: theme.shadows[4],
            },
          },
          '& .ql-snow .ql-picker': {
            color: theme.palette.text.primary,
          },
          '& .ql-snow .ql-stroke': {
            stroke: theme.palette.text.primary,
          },
          '& .ql-snow .ql-fill': {
            fill: theme.palette.text.primary,
          },
          '& .ql-snow.ql-toolbar button:hover, .ql-snow.ql-toolbar button:focus, .ql-snow.ql-toolbar button.ql-active': {
            color: theme.palette.primary.main,
            '& .ql-stroke': {
              stroke: theme.palette.primary.main,
            },
            '& .ql-fill': {
              fill: theme.palette.primary.main,
            },
          },
        }}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={translatedPlaceholder}
        />
      </Paper>
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            ml: isMobile ? 1 : 1.5,
            mr: isMobile ? 1 : 0,
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
            fontSize: isMobile ? '0.7rem' : '0.75rem',
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
