import React, { useEffect, useRef } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  Badge,
  Tooltip,
  alpha,
} from '@mui/material';
import logoImage from '../../../assets/images/logo.png';
import iconImage from '../../../assets/images/icon.png';
import {
  Dashboard,
  People,
  Inventory,
  Inventory2,
  Category,
  Tune,
  LocalOffer,
  ShoppingCart,
  Receipt,
  Settings,
  ExpandLess,
  ExpandMore,
  Storefront,
  Campaign,
  PhotoLibrary,
  Support,
  Analytics,
  Build,
  Notifications,
  MarkunreadMailbox,
  Assessment,
  GetApp,
  Description,
  ViewModule,
  Security,
  Monitor,
  BugReport,
  AdminPanelSettings,
  Favorite,
  LocationOn,
  Search as SearchIcon,
  Policy,
  DeleteForever,
  VerifiedUser,
  Info,
  Sync,
  AddCircleOutline,
  Backup as BackupIcon,
  OnlinePrediction,
  SmartToy,
  MenuBook,
  Chat,
  Web,
  Assignment,
  Article,
  ContactMail,
  Store,
  Settings as SettingsIcon,
  CloudDownload,
  Schedule,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { PERMISSIONS, filterMenuByPermissions } from '@/shared/constants/permissions';
import { useUnreadSupportCount } from '@/features/support/hooks/useSupport';
import { usePendingOrdersCount } from '@/features/orders/hooks/useOrders';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  badge?: number;
}

interface SidebarProps {
  width: number;
  expandedWidth: number;
  collapsedWidth: number;
  collapsed: boolean;
  open: boolean;
  onClose: () => void;
  onExpandRequest?: () => void;
  variant: 'permanent' | 'temporary';
}

const AR_NAV_LABELS: Record<string, string> = {
  'navigation.about': 'من نحن',
  'navigation.addresses': 'العناوين',
  'navigation.adminManagement': 'إدارة المشرفين',
  'navigation.analytics': 'الإحصائيات',
  'navigation.analyticsAdvanced': 'إحصائيات متقدمة',
  'navigation.analyticsDashboard': 'لوحة الإحصائيات',
  'navigation.analyticsExport': 'تصدير البيانات',
  'navigation.analyticsMain': 'نظام التحليلات الشامل',
  'navigation.analyticsReports': 'إدارة التقارير',
  'navigation.attributes': 'السمات',
  'navigation.audit': 'السجلات والتدقيق',
  'navigation.auditAnalytics': 'تحليلات التدقيق',
  'navigation.auditLogs': 'سجلات التدقيق',
  'navigation.auditMain': 'نظام التدقيق الشامل',
  'navigation.backups': 'النسخ الاحتياطي',
  'navigation.banners': 'البنرات',
  'navigation.brands': 'العلامات التجارية',
  'navigation.cartsAnalytics': 'تحليلات السلة',
  'navigation.cartsList': 'قائمة السلال',
  'navigation.cartsManagement': 'إدارة السلال',
  'navigation.catalog': 'الكتالوج',
  'navigation.categories': 'الفئات',
  'navigation.coupons': 'الكوبونات',
  'navigation.couponsAnalytics': 'تحليلات الكوبونات',
  'navigation.couponsList': 'قائمة الكوبونات',
  'navigation.dashboard': 'لوحة التحكم',
  'navigation.engineerCoupons': 'كوبونات المهندسين',
  'navigation.engineers': 'المهندسين',
  'navigation.engineersCommissions': 'تقرير عمولات المهندسين',
  'navigation.errorLogs': 'سجلات الأخطاء',
  'navigation.exchangeRates': 'أسعار الصرف',
  'navigation.favorites': 'المفضلة',
  'navigation.installationGuides': 'طرق التركيب',
  'navigation.marketerPortal': 'بوابة المسوّق',
  'navigation.marketersManagement': 'إدارة المسوّقين',
  'navigation.marketersSurveyStats': 'إحصائيات استبيان التجار',
  'navigation.marketing': 'التسويق',
  'navigation.marketingDashboard': 'لوحة التسويق',
  'navigation.media': 'مكتبة الوسائط',
  'navigation.mediaAnalytics': 'إحصائيات الوسائط',
  'navigation.mediaLibrary': 'مكتبة الوسائط',
  'navigation.notifications': 'الإشعارات',
  'navigation.notificationsAnalytics': 'إحصائيات الإشعارات',
  'navigation.notificationsChannelConfigs': 'إعدادات القنوات',
  'navigation.notificationsList': 'قائمة الإشعارات',
  'navigation.notificationsTemplates': 'قوالب الإشعارات',
  'navigation.smsCampaigns': 'حملات SMS',
  'navigation.orders': 'الطلبات',
  'navigation.ordersAnalytics': 'تحليلات الطلبات',
  'navigation.ordersList': 'قائمة الطلبات',
  'navigation.ordersOutOfStock': 'الطلبات غير المتوفرة',
  'navigation.policies': 'السياسات',
  'navigation.priceRules': 'قواعد الأسعار',
  'navigation.products': 'المنتجات',
  'navigation.productsAnalytics': 'تحليلات المنتجات',
  'navigation.productsIntegration': 'ربط المخزون',
  'navigation.productsInventory': 'إدارة المخزون',
  'navigation.productsLinked': 'المنتجات المربوطة',
  'navigation.productsList': 'قائمة المنتجات',
  'navigation.productsUnlinked': 'فرص الإضافة',
  'navigation.sales': 'المبيعات',
  'navigation.search': 'البحث',
  'navigation.services': 'الخدمات',
  'navigation.servicesAnalytics': 'تحليلات الخدمات',
  'navigation.servicesEngineers': 'إدارة المهندسين',
  'navigation.servicesOffers': 'إدارة العروض',
  'navigation.servicesOverview': 'نظرة عامة',
  'navigation.servicesRequests': 'طلبات الخدمات',
  'navigation.support': 'الدعم الفني',
  'navigation.supportCannedResponses': 'الردود الجاهزة',
  'navigation.supportStats': 'إحصائيات الدعم',
  'navigation.supportTickets': 'قائمة التذاكر',
  'navigation.systemManagement': 'إدارة النظام',
  'navigation.systemMonitoring': 'مراقبة الأداء',
  'navigation.systemSettings': 'إعدادات النظام',
  'navigation.tejoAnalytics': 'تحليلات Tejo',
  'navigation.tejoConversations': 'محادثات Tejo',
  'navigation.tejoKnowledge': 'معرفة Tejo',
  'navigation.tejoPrompts': 'موجّهات Tejo',
  'navigation.tejoSettings': 'إعدادات Tejo',
  'navigation.users': 'المستخدمون',
  'navigation.usersActivity': 'تتبع النشاط',
  'navigation.usersAnalytics': 'تحليلات المستخدمين',
  'navigation.usersDeleted': 'الحسابات المحذوفة',
  'navigation.usersList': 'قائمة المستخدمين',
  'navigation.verificationRequests': 'طلبات التحقق',
  'navigation.websiteContent': 'محتوى الموقع',
  'navigation.landingSettings': 'إعدادات صفحة الهبوط',
  'navigation.landingProjects': 'المشاريع',
  'navigation.landingArticles': 'الأخبار والمقالات',
  'navigation.landingProducts': 'منتجات صفحة الهبوط',
  'navigation.landingBrands': 'براندات صفحة الهبوط',
  'navigation.contactRequests': 'طلبات التواصل',
  'navigation.scheduledReports': 'التقارير المجدولة',
  'navigation.exportCenter': 'مركز التصدير',
};

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  expandedWidth,
  collapsedWidth,
  collapsed,
  open,
  onClose,
  onExpandRequest,
  variant,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const isArabicLocale = i18n.language.toLowerCase().startsWith('ar');
  const navLabel = React.useCallback(
    (key: string) => {
      if (isArabicLocale && AR_NAV_LABELS[key]) {
        return AR_NAV_LABELS[key];
      }
      return t(key);
    },
    [isArabicLocale, t]
  );
  const appName = isArabicLocale ? 'لوحة تحكم تجدد' : t('app.name');
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const { data: unreadSupport } = useUnreadSupportCount(60000);
  const unreadSupportCount = unreadSupport?.unreadTicketsCount ?? 0;
  const { data: pendingOrders } = usePendingOrdersCount(60000);
  const pendingOrdersCount = pendingOrders?.pendingCount ?? 0;
  const drawerWidth =
    variant === 'permanent' ? (collapsed ? collapsedWidth : width) : expandedWidth;

  const menuItems: MenuItem[] = React.useMemo(
    () => [
      {
        id: 'dashboard',
        label: navLabel('navigation.dashboard'),
        icon: <Dashboard />,
        path: '/dashboard',
      },
      {
        id: 'users',
        label: navLabel('navigation.users'),
        icon: <People />,
        children: [
          {
            id: 'users-list',
            label: navLabel('navigation.usersList'),
            icon: <People />,
            path: '/users',
          },
          {
            id: 'users-analytics',
            label: navLabel('navigation.usersAnalytics'),
            icon: <Assessment />,
            path: '/users/analytics',
          },
          {
            id: 'users-deleted',
            label: navLabel('navigation.usersDeleted'),
            icon: <DeleteForever />,
            path: '/users/deleted',
          },
          {
            id: 'users-verification',
            label: navLabel('navigation.verificationRequests'),
            icon: <VerifiedUser />,
            path: '/users/verification-requests',
          },
          {
            id: 'users-activity',
            label: navLabel('navigation.usersActivity'),
            icon: <OnlinePrediction />,
            path: '/users/activity',
          },
          {
            id: 'users-addresses',
            label: navLabel('navigation.addresses'),
            icon: <LocationOn />,
            path: '/admin/addresses',
          },
          {
            id: 'users-favorites',
            label: navLabel('navigation.favorites'),
            icon: <Favorite />,
            path: '/admin/favorites',
          },
        ],
      },
      {
        id: 'catalog',
        label: navLabel('navigation.catalog'),
        icon: <Inventory />,
        children: [
          {
            id: 'products',
            label: navLabel('navigation.products'),
            icon: <Inventory />,
            children: [
              {
                id: 'products-list',
                label: navLabel('navigation.productsList'),
                icon: <Inventory />,
                path: '/products',
              },
              {
                id: 'products-analytics',
                label: navLabel('navigation.productsAnalytics'),
                icon: <Assessment />,
                path: '/products/analytics',
              },
              {
                id: 'products-inventory',
                label: navLabel('navigation.productsInventory'),
                icon: <ViewModule />,
                path: '/products/inventory',
              },
              {
                id: 'products-integration',
                label: navLabel('navigation.productsIntegration'),
                icon: <Sync />,
                path: '/products/integration',
              },
              {
                id: 'products-unlinked',
                label: navLabel('navigation.productsUnlinked'),
                icon: <AddCircleOutline />,
                path: '/products/unlinked',
              },
              {
                id: 'products-linked',
                label: navLabel('navigation.productsLinked'),
                icon: <Sync />,
                path: '/products/linked',
              },
            ],
          },
          {
            id: 'categories',
            label: navLabel('navigation.categories'),
            icon: <Category />,
            path: '/categories',
          },
          {
            id: 'attributes',
            label: navLabel('navigation.attributes'),
            icon: <Tune />,
            path: '/attributes',
          },
          {
            id: 'brands',
            label: navLabel('navigation.brands'),
            icon: <Storefront />,
            path: '/brands',
          },
        ],
      },
      {
        id: 'sales',
        label: navLabel('navigation.sales'),
        icon: <ShoppingCart />,
        children: [
          {
            id: 'orders',
            label: navLabel('navigation.orders'),
            icon: <Receipt />,
            children: [
              {
                id: 'orders-list',
                label: navLabel('navigation.ordersList'),
                icon: <Receipt />,
                path: '/orders',
              },
              {
                id: 'orders-out-of-stock',
                label: navLabel('navigation.ordersOutOfStock'),
                icon: <Inventory2 />,
                path: '/orders/out-of-stock',
              },
              {
                id: 'orders-analytics',
                label: navLabel('navigation.ordersAnalytics'),
                icon: <Assessment />,
                path: '/orders/analytics',
              },
            ],
          },
          {
            id: 'carts',
            label: navLabel('navigation.cartsManagement'),
            icon: <ShoppingCart />,
            children: [
              {
                id: 'carts-list',
                label: navLabel('navigation.cartsList'),
                icon: <ShoppingCart />,
                path: '/carts',
              },
              {
                id: 'carts-analytics',
                label: navLabel('navigation.cartsAnalytics'),
                icon: <Assessment />,
                path: '/carts/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'marketing',
        label: navLabel('navigation.marketing'),
        icon: <Campaign />,
        children: [
          {
            id: 'marketing-dashboard',
            label: navLabel('navigation.marketingDashboard'),
            icon: <Dashboard />,
            path: '/marketing',
          },
          {
            id: 'price-rules',
            label: navLabel('navigation.priceRules'),
            icon: <LocalOffer />,
            path: '/marketing/price-rules',
          },
          {
            id: 'banners',
            label: navLabel('navigation.banners'),
            icon: <Campaign />,
            path: '/banners',
          },
          {
            id: 'installation-guides',
            label: navLabel('navigation.installationGuides'),
            icon: <MenuBook />,
            path: '/marketing/installation-guides',
          },
          {
            id: 'coupons',
            label: navLabel('navigation.coupons'),
            icon: <LocalOffer />,
            children: [
              {
                id: 'coupons-list',
                label: navLabel('navigation.couponsList'),
                icon: <LocalOffer />,
                path: '/coupons',
              },
              {
                id: 'coupons-analytics',
                label: navLabel('navigation.couponsAnalytics'),
                icon: <Assessment />,
                path: '/coupons/analytics',
              },
            ],
          },
        ],
      },
      {
        id: 'services',
        label: navLabel('navigation.services'),
        icon: <Build />,
        children: [
          {
            id: 'services-overview',
            label: navLabel('navigation.servicesOverview'),
            icon: <Dashboard />,
            path: '/services',
          },
          {
            id: 'services-requests',
            label: navLabel('navigation.servicesRequests'),
            icon: <Build />,
            path: '/services/requests',
          },
          {
            id: 'services-offers',
            label: navLabel('navigation.servicesOffers'),
            icon: <LocalOffer />,
            path: '/services/offers',
          },
          {
            id: 'services-analytics',
            label: navLabel('navigation.servicesAnalytics'),
            icon: <Analytics />,
            path: '/services/analytics',
          },
        ],
      },
      {
        id: 'engineers',
        label: navLabel('navigation.engineers'),
        icon: <People />,
        children: [
          {
            id: 'engineers-management',
            label: navLabel('navigation.servicesEngineers'),
            icon: <People />,
            path: '/services/engineers',
          },
          {
            id: 'engineers-coupons',
            label: navLabel('navigation.engineerCoupons'),
            icon: <LocalOffer />,
            path: '/services/engineers/coupons',
          },
          {
            id: 'engineers-commissions',
            label: navLabel('navigation.engineersCommissions'),
            icon: <Receipt />,
            path: '/commissions/reports',
          },
        ],
      },
      {
        id: 'media',
        label: navLabel('navigation.media'),
        icon: <PhotoLibrary />,
        children: [
          {
            id: 'media-library',
            label: navLabel('navigation.mediaLibrary'),
            icon: <PhotoLibrary />,
            path: '/media',
          },
          {
            id: 'media-analytics',
            label: navLabel('navigation.mediaAnalytics'),
            icon: <Assessment />,
            path: '/media/analytics',
          },
        ],
      },
      {
        id: 'analytics',
        label: navLabel('navigation.analytics'),
        icon: <Analytics />,
        children: [
          {
            id: 'analytics-dashboard',
            label: navLabel('navigation.analyticsDashboard'),
            icon: <Analytics />,
            path: '/analytics',
          },
          {
            id: 'analytics-main',
            label: navLabel('navigation.analyticsMain'),
            icon: <Dashboard />,
            path: '/analytics/main',
          },
          {
            id: 'analytics-advanced',
            label: navLabel('navigation.analyticsAdvanced'),
            icon: <Assessment />,
            path: '/analytics/advanced',
          },
          {
            id: 'analytics-reports',
            label: navLabel('navigation.analyticsReports'),
            icon: <Description />,
            path: '/analytics/reports',
          },
          {
            id: 'analytics-scheduled-reports',
            label: 'التقارير المجدولة',
            icon: <Schedule />,
            path: '/analytics/scheduled-reports',
          },
          {
            id: 'analytics-export',
            label: navLabel('navigation.analyticsExport'),
            icon: <GetApp />,
            path: '/analytics/export',
          },
          {
            id: 'analytics-export-center',
            label: 'مركز التصدير',
            icon: <CloudDownload />,
            path: '/analytics/export-center',
          },
        ],
      },
      {
        id: 'audit',
        label: navLabel('navigation.audit'),
        icon: <Security />,
        children: [
          {
            id: 'audit-logs',
            label: navLabel('navigation.auditLogs'),
            icon: <Security />,
            path: '/audit',
          },
          {
            id: 'audit-main',
            label: navLabel('navigation.auditMain'),
            icon: <Dashboard />,
            path: '/audit/main',
          },
          {
            id: 'audit-analytics',
            label: navLabel('navigation.auditAnalytics'),
            icon: <Assessment />,
            path: '/audit/analytics',
          },
        ],
      },
      {
        id: 'support',
        label: navLabel('navigation.support'),
        icon: <Support />,
        children: [
          {
            id: 'support-tickets',
            label: navLabel('navigation.supportTickets'),
            icon: <Support />,
            path: '/support',
          },
          {
            id: 'support-stats',
            label: navLabel('navigation.supportStats'),
            icon: <Assessment />,
            path: '/support/stats',
          },
          {
            id: 'support-canned-responses',
            label: navLabel('navigation.supportCannedResponses'),
            icon: <ViewModule />,
            path: '/support/canned-responses',
          },
          {
            id: 'support-tejo-prompts',
            label: navLabel('navigation.tejoPrompts'),
            icon: <SmartToy />,
            path: '/support/tejo/prompts',
          },
          {
            id: 'support-tejo-analytics',
            label: navLabel('navigation.tejoAnalytics'),
            icon: <Assessment />,
            path: '/support/tejo/analytics',
          },
          {
            id: 'support-tejo-conversations',
            label: navLabel('navigation.tejoConversations'),
            icon: <Support />,
            path: '/support/tejo/conversations',
          },
          {
            id: 'support-tejo-settings',
            label: navLabel('navigation.tejoSettings'),
            icon: <Settings />,
            path: '/support/tejo/settings',
          },
          {
            id: 'support-tejo-knowledge',
            label: navLabel('navigation.tejoKnowledge'),
            icon: <SmartToy />,
            path: '/support/tejo/knowledge',
          },
          {
            id: 'support-tejo-sessions',
            label: 'محادثات تيجو',
            icon: <Chat />,
            path: '/support/tejo/sessions',
          },
        ],
      },
      {
        id: 'notifications',
        label: navLabel('navigation.notifications'),
        icon: <Notifications />,
        children: [
          {
            id: 'notifications-list',
            label: navLabel('navigation.notificationsList'),
            icon: <Notifications />,
            path: '/notifications',
          },
          {
            id: 'notifications-analytics',
            label: navLabel('navigation.notificationsAnalytics'),
            icon: <Assessment />,
            path: '/notifications/analytics',
          },
          {
            id: 'notifications-templates',
            label: navLabel('navigation.notificationsTemplates'),
            icon: <ViewModule />,
            path: '/notifications/templates',
          },
          {
            id: 'notifications-channel-configs',
            label: navLabel('navigation.notificationsChannelConfigs'),
            icon: <Settings />,
            path: '/notifications/channel-configs',
          },
          {
            id: 'sms-campaigns',
            label: navLabel('navigation.smsCampaigns'),
            icon: <MarkunreadMailbox />,
            path: '/sms-campaigns',
          },
        ],
      },
      {
        id: 'system-management',
        label: navLabel('navigation.systemManagement'),
        icon: <AdminPanelSettings />,
        children: [
          {
            id: 'system-monitoring',
            label: navLabel('navigation.systemMonitoring'),
            icon: <Monitor />,
            path: '/system/monitoring',
          },
          {
            id: 'error-logs',
            label: navLabel('navigation.errorLogs'),
            icon: <BugReport />,
            path: '/system/error-logs',
          },

          {
            id: 'system-settings',
            label: navLabel('navigation.systemSettings'),
            icon: <Settings />,
            path: '/system/settings',
          },
          {
            id: 'backups',
            label: navLabel('navigation.backups'),
            icon: <BackupIcon />,
            path: '/system/backups',
          },
          {
            id: 'policies',
            label: navLabel('navigation.policies'),
            icon: <Policy />,
            path: '/policies',
          },
          {
            id: 'about',
            label: navLabel('navigation.about'),
            icon: <Info />,
            path: '/about',
          },
        ],
      },
      {
        id: 'website-content',
        label: navLabel('navigation.websiteContent'),
        icon: <Web />,
        children: [
          {
            id: 'landing-settings',
            label: navLabel('navigation.landingSettings'),
            icon: <SettingsIcon />,
            path: '/website/landing-settings',
          },
          {
            id: 'landing-projects',
            label: navLabel('navigation.landingProjects'),
            icon: <Assignment />,
            path: '/website/projects',
          },
          {
            id: 'landing-articles',
            label: navLabel('navigation.landingArticles'),
            icon: <Article />,
            path: '/website/articles',
          },
          {
            id: 'landing-products',
            label: navLabel('navigation.landingProducts'),
            icon: <Store />,
            path: '/website/landing-products',
          },
          {
            id: 'landing-brands',
            label: navLabel('navigation.landingBrands'),
            icon: <Storefront />,
            path: '/website/landing-brands',
          },
          {
            id: 'contact-requests',
            label: navLabel('navigation.contactRequests'),
            icon: <ContactMail />,
            path: '/website/contact-requests',
          },
        ],
      },
      {
        id: 'exchange-rates',
        label: navLabel('navigation.exchangeRates'),
        icon: <Assessment />,
        path: '/exchange-rates',
      },
      {
        id: 'admin-management',
        label: navLabel('navigation.adminManagement'),
        icon: <AdminPanelSettings />,
        children: [
          {
            id: 'admin-search',
            label: navLabel('navigation.search'),
            icon: <SearchIcon />,
            path: '/admin/search',
          },
          {
            id: 'marketer-portal',
            label: navLabel('navigation.marketerPortal'),
            icon: <AddCircleOutline />,
            path: '/marketer/portal',
          },
          {
            id: 'admin-marketers',
            label: navLabel('navigation.marketersManagement'),
            icon: <Campaign />,
            path: '/admin/marketers',
          },
          {
            id: 'admin-marketers-survey',
            label: navLabel('navigation.marketersSurveyStats'),
            icon: <Analytics />,
            path: '/admin/marketers/survey',
          },
        ],
      },
    ],
    [t, i18n.language]
  );

  const menuItemsWithBadges = React.useMemo(() => {
    const addBadges = (items: MenuItem[]): MenuItem[] => {
      return items.map((item) => {
        const newItem = { ...item };

        if (item.id === 'sales' && pendingOrdersCount > 0) {
          newItem.badge = pendingOrdersCount;
        }

        if (item.id === 'support' && unreadSupportCount > 0) {
          newItem.badge = unreadSupportCount;
        }

        if (item.children) {
          newItem.children = addBadges(item.children);
        }

        return newItem;
      });
    };

    return addBadges(menuItems);
  }, [menuItems, pendingOrdersCount, unreadSupportCount]);

  const userPermissions = React.useMemo(() => {
    const normalized = Array.isArray(user?.permissions) ? [...user.permissions] : [];
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const isSuperAdminRole = roles.includes('super_admin');
    const hasSuperAdminPermission = normalized.includes(PERMISSIONS.SUPER_ADMIN_ACCESS);

    if (isSuperAdminRole || hasSuperAdminPermission) {
      if (!normalized.includes(PERMISSIONS.ADMIN_ACCESS)) {
        normalized.push(PERMISSIONS.ADMIN_ACCESS);
      }
      if (!normalized.includes(PERMISSIONS.SUPER_ADMIN_ACCESS)) {
        normalized.push(PERMISSIONS.SUPER_ADMIN_ACCESS);
      }
    }

    return normalized;
  }, [user?.permissions, user?.roles]);

  const filteredMenuItems = React.useMemo(() => {
    return filterMenuByPermissions(menuItemsWithBadges, userPermissions);
  }, [menuItemsWithBadges, userPermissions]);

  useEffect(() => {
    const findActiveParents = (items: MenuItem[], path: string): string[] => {
      const parents: string[] = [];

      const traverse = (items: MenuItem[], currentPath: string[] = []): boolean => {
        for (const item of items) {
          if (item.path && path.startsWith(item.path)) {
            parents.push(...currentPath);
            return true;
          }
          if (item.children) {
            if (traverse(item.children, [...currentPath, item.id])) {
              parents.push(...currentPath);
              return true;
            }
          }
        }
        return false;
      };

      traverse(items);
      return parents;
    };

    const activeParents = findActiveParents(filteredMenuItems, location.pathname);
    if (activeParents.length > 0) {
      setExpandedItems((prev) => {
        const newExpanded = [...new Set([...prev, ...activeParents])];
        return newExpanded;
      });
    }
  }, [location.pathname, filteredMenuItems]);

  useEffect(() => {
    if (open && activeItemRef.current) {
      setTimeout(() => {
        if (activeItemRef.current) {
          activeItemRef.current.focus();
          activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 150);
    }
  }, [open, location.pathname]);

  const handleToggleExpand = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = Boolean(item.path && location.pathname.startsWith(item.path));

    const handleItemClick = () => {
      if (collapsed && hasChildren) {
        onExpandRequest?.();
        setExpandedItems((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
        return;
      }

      if (hasChildren) {
        handleToggleExpand(item.id);
      } else if (item.path) {
        handleNavigate(item.path);
      }
    };

    const itemButton = (
      <ListItemButton
        ref={isActive ? activeItemRef : null}
        selected={isActive}
        onClick={handleItemClick}
        sx={{
          minHeight: 44,
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1.25 : 1.5,
          py: 1,
          paddingInlineStart: collapsed ? 1.25 : 2 + depth * 1.75,
          borderRadius: 3,
          mx: 1,
          my: 0.35,
          color: 'text.secondary',
          overflow: 'hidden',
          transition: (theme) =>
            theme.transitions.create(['background-color', 'color', 'padding', 'transform'], {
              duration: theme.transitions.duration.shorter,
            }),
          '& .MuiListItemIcon-root': {
            minWidth: collapsed ? 0 : 38,
            justifyContent: 'center',
            color: 'inherit',
            transition: (theme) =>
              theme.transitions.create(['min-width', 'color'], {
                duration: theme.transitions.duration.shorter,
              }),
          },
          '&.Mui-selected': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, collapsed ? 0.18 : 0.13),
            color: 'primary.main',
            fontWeight: 800,
            boxShadow: (theme) => `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}`,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            },
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
          },
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            color: 'text.primary',
            transform: 'translateX(-1px)',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        }}
      >
        {item.icon && (
          <ListItemIcon>
            {item.badge && item.badge > 0 ? (
              <Badge badgeContent={item.badge} color="error" max={99}>
                {item.icon}
              </Badge>
            ) : (
              item.icon
            )}
          </ListItemIcon>
        )}

        {!collapsed && (
          <ListItemText
            primary={
              item.id === 'support' && unreadSupportCount > 0 ? (
                <Badge badgeContent={unreadSupportCount} color="error" max={99}>
                  <span>{item.label}</span>
                </Badge>
              ) : (
                item.label
              )
            }
            primaryTypographyProps={{
              fontSize: depth > 0 ? '0.84rem' : '0.9rem',
              fontWeight: isActive ? 800 : 650,
              noWrap: true,
            }}
            sx={{ minWidth: 0, my: 0 }}
          />
        )}

        {!collapsed && hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
    );

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          {collapsed ? (
            <Tooltip title={item.label} placement="left" arrow>
              {itemButton}
            </Tooltip>
          ) : (
            itemButton
          )}
        </ListItem>

        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Box
        sx={{
          height: { xs: 64, md: 72 },
          px: collapsed ? 1.25 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.25,
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.75),
          transition: (theme) =>
            theme.transitions.create(['padding', 'height'], {
              duration: theme.transitions.duration.shorter,
            }),
        }}
      >
        <Box
          component="img"
          src={collapsed ? iconImage : logoImage}
          alt="Tagadod Logo"
          sx={{
            height: collapsed ? 38 : 54,
            width: collapsed ? 38 : 'auto',
            maxWidth: collapsed ? 38 : '100%',
            objectFit: 'contain',
            flexShrink: 0,
            filter: 'drop-shadow(0 8px 16px rgba(15, 23, 42, 0.16))',
            transition: (theme) =>
              theme.transitions.create(['height', 'width', 'max-width'], {
                duration: theme.transitions.duration.shorter,
              }),
          }}
        />

        {!collapsed && (
          <Typography variant="h6" fontWeight="bold" noWrap sx={{ lineHeight: 1.2 }}>
            {appName}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1.25,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.28),
            borderRadius: 999,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.42),
          },
        }}
      >
        <List disablePadding>{filteredMenuItems.map((item) => renderMenuItem(item))}</List>
      </Box>

      <Box
        sx={{
          minHeight: collapsed ? 52 : 64,
          p: collapsed ? 1 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.65),
        }}
      >
        {collapsed ? (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 0 0 6px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            © 2025 Tagadod
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: false }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
          }),
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          maxWidth: '100vw',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          borderInlineEnd: variant === 'permanent' ? '1px solid' : 'none',
          borderColor: (theme) => alpha(theme.palette.divider, 0.75),
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.96)
              : alpha(theme.palette.background.paper, 0.98),
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent 34%)`
              : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.045)}, transparent 36%)`,
          backdropFilter: 'blur(16px)',
          boxShadow: variant === 'temporary' ? 24 : 'none',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
