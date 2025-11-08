import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const latestValueRef = useRef(value ?? '');
  const onChangeRef = useRef(onChange);
  
  // استخدام الترجمة للنص الافتراضي إذا لم يتم تمرير placeholder
  const translatedPlaceholder = placeholder || t('editor.placeholder');
  const translatedLabel = label || t('editor.label');

  const modules = useMemo(() => {
    const toolbarConfig = isMobile
      ? [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'],
        ]
      : isTablet
      ? [
          [{ header: [1, 2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
          [{ color: [] }, { background: [] }],
        ]
      : [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
        ];

    return {
      toolbar: toolbarConfig,
    };
  }, [isMobile, isTablet]);

  const formats = useMemo(
    () => [
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
      'clean',
      'color',
      'background',
      'font',
      'size',
    ],
    []
  );

  // حساب minHeight متجاوب
  const responsiveMinHeight = isMobile ? Math.max(minHeight * 0.7, 200) : isTablet ? Math.max(minHeight * 0.85, 250) : minHeight;

  const normalizeHtml = (html: string) => {
    if (!html) {
      return '';
    }
    return html === '<p><br></p>' ? '' : html;
  };

  useEffect(() => {
    latestValueRef.current = value ?? '';
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = '';
    const editorElement = document.createElement('div');
    container.appendChild(editorElement);

    const quill = new Quill(editorElement, {
      theme: 'snow',
      modules,
      placeholder: translatedPlaceholder,
      formats,
    });

    quillRef.current = quill;
    const initialValue = normalizeHtml(value ?? '');
    if (initialValue) {
      quill.clipboard.dangerouslyPasteHTML(initialValue, 'silent');
    } else {
      quill.setText('', 'silent');
    }

    quill.root.setAttribute('dir', 'rtl');
    quill.root.style.minHeight = `${responsiveMinHeight}px`;

    const handleTextChange = () => {
      const editorHtml = normalizeHtml(quill.root.innerHTML);
      if (editorHtml !== latestValueRef.current) {
        latestValueRef.current = editorHtml;
        onChangeRef.current(editorHtml);
      }
    };

    quill.on('text-change', handleTextChange);

    return () => {
      quill.off('text-change', handleTextChange);
      quillRef.current = null;
      container.innerHTML = '';
    };
  }, [modules, translatedPlaceholder, responsiveMinHeight]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) {
      return;
    }
    const normalizedValue = normalizeHtml(value ?? '');
    const currentHtml = normalizeHtml(quill.root.innerHTML);
    if (normalizedValue !== currentHtml) {
      const selection = quill.getSelection();
      if (normalizedValue) {
        quill.clipboard.dangerouslyPasteHTML(normalizedValue, 'silent');
      } else {
        quill.setText('', 'silent');
      }
      if (selection) {
        quill.setSelection(selection);
      }
      latestValueRef.current = normalizedValue;
    }
  }, [value]);

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
          '& .ql-toolbar.ql-snow': {
            border: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
            padding: isMobile ? '10px 8px' : '12px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: isMobile ? '4px' : '8px',
            
            '& .ql-formats': {
              marginRight: 0,
              marginLeft: 0,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '2px' : '4px',
            },
            
            '& button': {
              width: isMobile ? '32px !important' : '36px !important',
              height: isMobile ? '32px !important' : '36px !important',
              padding: '0 !important',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              backgroundColor: theme.palette.background.paper,
              transition: 'all 0.2s ease',
              
              '& svg': {
                width: isMobile ? '16px' : '18px',
                height: isMobile ? '16px' : '18px',
              },
              
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                borderColor: theme.palette.primary.main,
                '& .ql-stroke': {
                  stroke: theme.palette.primary.main,
                },
                '& .ql-fill': {
                  fill: theme.palette.primary.main,
                },
              },
              
              '&.ql-active': {
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                '& .ql-stroke': {
                  stroke: '#fff',
                },
                '& .ql-fill': {
                  fill: '#fff',
                },
              },
            },
            
            '& .ql-stroke': {
              stroke: theme.palette.text.primary,
              strokeWidth: '1.5',
            },
            
            '& .ql-fill': {
              fill: theme.palette.text.primary,
            },
            
            '& .ql-picker': {
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              backgroundColor: theme.palette.background.paper,
              padding: isMobile ? '4px 6px' : '6px 8px',
              height: isMobile ? '32px' : '36px',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
              },
              
              '&.ql-expanded': {
                borderColor: theme.palette.primary.main,
                '& .ql-picker-label': {
                  color: theme.palette.primary.main,
                },
              },
            },
            
            '& .ql-picker-label': {
              color: theme.palette.text.primary,
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              fontSize: isMobile ? '13px' : '14px',
              
              '&::before': {
                lineHeight: 'normal',
              },
              
              '& .ql-stroke': {
                stroke: theme.palette.text.primary,
              },
            },
            
            '& .ql-picker-options': {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              boxShadow: theme.shadows[8],
              padding: '4px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              
              '& .ql-picker-item': {
                padding: '6px 12px',
                borderRadius: '4px',
                color: theme.palette.text.primary,
                transition: 'all 0.15s ease',
                
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.04)',
                  color: theme.palette.primary.main,
                },
                
                '&.ql-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff',
                },
              },
            },
            
            '& .ql-color-picker, & .ql-background': {
              '& .ql-picker-label': {
                width: isMobile ? '32px' : '36px',
                height: isMobile ? '32px' : '36px',
                padding: 0,
                
                '& svg': {
                  width: '100%',
                  height: '100%',
                },
              },
            },
          },
          
          '& .ql-snow .ql-tooltip': {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: theme.shadows[8],
            padding: '8px 12px',
            color: theme.palette.text.primary,
            
            '& input[type="text"]': {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              padding: '6px 8px',
              color: theme.palette.text.primary,
              fontSize: '14px',
              
              '&:focus': {
                outline: 'none',
                borderColor: theme.palette.primary.main,
              },
            },
            
            '& a': {
              color: theme.palette.primary.main,
              
              '&:hover': {
                color: theme.palette.primary.dark,
              },
            },
          },
        }}
      >
        <div ref={containerRef} />
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
