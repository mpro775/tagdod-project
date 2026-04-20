import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  MarketersAnalyticsOverview,
  MarketersRankingResponse,
  MarketerAnalyticsDetails,
} from '../types/marketer.types';

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMarketersAnalyticsExcel = (payload: {
  overview: MarketersAnalyticsOverview;
  ranking?: MarketersRankingResponse;
  details?: MarketerAnalyticsDetails;
}) => {
  const workbook = XLSX.utils.book_new();

  const overviewSheet = XLSX.utils.json_to_sheet([
    {
      from: payload.overview.from,
      to: payload.overview.to,
      totalLeads: payload.overview.totalLeads,
      approvedTotal: payload.overview.approvedTotal,
      conversionRate: payload.overview.overallConversionRate,
      previousTotalLeads: payload.overview.previousPeriod.totalLeads,
      leadsGrowthPercent: payload.overview.comparison.leadsGrowthPercent,
      conversionGrowthPercent: payload.overview.comparison.conversionGrowthPercent,
    },
  ]);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

  if (payload.ranking?.items?.length) {
    const rankingSheet = XLSX.utils.json_to_sheet(
      payload.ranking.items.map((item) => ({
        rank: item.rank,
        marketerName: `${item.marketer.firstName || ''} ${item.marketer.lastName || ''}`.trim(),
        phone: item.marketer.phone,
        totalLeads: item.totalLeads,
        approvedTotal: item.approvedTotal,
        conversionRate: item.conversionRate,
      })),
    );
    XLSX.utils.book_append_sheet(workbook, rankingSheet, 'Ranking');
  }

  if (payload.details?.dailyTrend?.length) {
    const trendSheet = XLSX.utils.json_to_sheet(
      payload.details.dailyTrend.map((item) => ({
        day: item.day,
        leads: item.leads,
        engineers: item.engineers,
        merchants: item.merchants,
        approvedLeads: item.approvedLeads || 0,
      })),
    );
    XLSX.utils.book_append_sheet(workbook, trendSheet, 'DailyTrend');
  }

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `marketers_analytics_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportMarketersAnalyticsPdf = (payload: {
  overview: MarketersAnalyticsOverview;
  ranking?: MarketersRankingResponse;
}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  doc.setFontSize(14);
  doc.text('Marketers Analytics Report', 40, 40);
  doc.setFontSize(10);
  doc.text(`Period: ${payload.overview.from} -> ${payload.overview.to}`, 40, 58);

  autoTable(doc, {
    startY: 75,
    head: [['Metric', 'Value']],
    body: [
      ['Total Leads', String(payload.overview.totalLeads)],
      ['Approved Leads', String(payload.overview.approvedTotal)],
      ['Conversion Rate', `${payload.overview.overallConversionRate}%`],
      ['Previous Total Leads', String(payload.overview.previousPeriod.totalLeads)],
      ['Leads Growth', `${payload.overview.comparison.leadsGrowthPercent}%`],
      ['Conversion Growth', `${payload.overview.comparison.conversionGrowthPercent}%`],
    ],
    styles: { fontSize: 9 },
  });

  if (payload.ranking?.items?.length) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 200,
      head: [['Rank', 'Marketer', 'Phone', 'Leads', 'Approved', 'Conversion']],
      body: payload.ranking.items.map((item) => [
        String(item.rank),
        `${item.marketer.firstName || ''} ${item.marketer.lastName || ''}`.trim() || '-',
        item.marketer.phone || '-',
        String(item.totalLeads),
        String(item.approvedTotal),
        `${item.conversionRate}%`,
      ]),
      styles: { fontSize: 8 },
    });
  }

  doc.save(`marketers_analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportMarketerFullReport = (payload: {
  marketerName: string;
  from: string;
  to: string;
  details: MarketerAnalyticsDetails;
}) => {
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet([
    {
      marketer: payload.marketerName,
      periodFrom: payload.from,
      periodTo: payload.to,
      totalLeads: payload.details.summary.totalLeads,
      engineers: payload.details.summary.engineers,
      merchants: payload.details.summary.merchants,
      approvedEngineers: payload.details.summary.approvedEngineers,
      approvedMerchants: payload.details.summary.approvedMerchants,
      conversionRate: payload.details.summary.conversionRate,
    },
  ]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const trendRows = payload.details.dailyTrend.map((item) => ({
    day: item.day,
    leads: item.leads,
    engineers: item.engineers,
    merchants: item.merchants,
    approvedLeads: item.approvedLeads || 0,
  }));
  const trendSheet = XLSX.utils.json_to_sheet(
    trendRows.length > 0
      ? trendRows
      : [
          {
            day: '-',
            leads: 0,
            engineers: 0,
            merchants: 0,
            approvedLeads: 0,
          },
        ],
  );
  XLSX.utils.book_append_sheet(workbook, trendSheet, 'DailyTrend');

  const leadsRows = payload.details.latestLeads.map((lead) => ({
    phone: lead.phone,
    firstName: lead.firstName || '',
    lastName: lead.lastName || '',
    city: lead.city || '',
    type: lead.roles?.includes('engineer') ? 'engineer' : 'merchant',
    engineerStatus: lead.engineer_status || '',
    merchantStatus: lead.merchant_status || '',
    storeName: lead.storeName || '',
    storeAddress: lead.storeAddress || '',
    storeSize: lead.storeSize || '',
    previousCustomer: lead.previousCustomer || '',
    tejadodAwareness: lead.tejadodAwareness || '',
    verificationNote: lead.verificationNote || '',
    marketerCreatedAt: lead.marketerCreatedAt || lead.createdAt || '',
  }));
  const leadsSheet = XLSX.utils.json_to_sheet(
    leadsRows.length > 0
      ? leadsRows
      : [
          {
            phone: '-',
            firstName: '',
            lastName: '',
            city: '',
            type: '',
            engineerStatus: '',
            merchantStatus: '',
            storeName: '',
            storeAddress: '',
            storeSize: '',
            previousCustomer: '',
            tejadodAwareness: '',
            verificationNote: '',
            marketerCreatedAt: '',
          },
        ],
  );
  XLSX.utils.book_append_sheet(workbook, leadsSheet, 'AllLeads');

  const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const safeName = payload.marketerName.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]+/g, '_');
  downloadBlob(blob, `marketer_full_report_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
