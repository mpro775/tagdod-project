#!/usr/bin/env node

const fs = require('fs');

const BASE_URL = process.env.BASE_URL;
const TOKEN = process.env.TOKEN;
const OUTPUT = process.env.OUTPUT || 'user_names.csv';
const LIMIT = Number(process.env.LIMIT || 500);
const INCLUDE_DELETED = process.env.INCLUDE_DELETED === '1';

if (!BASE_URL || !TOKEN) {
  console.error('Missing required env vars: BASE_URL and TOKEN');
  console.error('Example: BASE_URL="https://api.example.com" TOKEN="..." node scripts/export-user-names.js');
  process.exit(1);
}

function toBooleanString(value) {
  return value ? 'true' : 'false';
}

function csvEscape(value) {
  const text = String(value || '');
  return `"${text.replace(/"/g, '""')}"`;
}

async function fetchUsersPage(page) {
  const url = new URL('/admin/users', BASE_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(LIMIT));
  url.searchParams.set('sortBy', 'createdAt');
  url.searchParams.set('sortOrder', 'desc');
  url.searchParams.set('includeDeleted', toBooleanString(INCLUDE_DELETED));

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed page ${page}: HTTP ${response.status} ${body}`);
  }

  return response.json();
}

async function run() {
  let page = 1;
  let totalPages = 1;
  const rows = [];

  do {
    const payload = await fetchUsersPage(page);
    const users = payload?.data?.users || [];
    totalPages = payload?.data?.totalPages || 1;

    for (const user of users) {
      rows.push({
        firstName: (user.firstName || '').trim(),
        lastName: (user.lastName || '').trim(),
      });
    }

    console.log(`Fetched page ${page}/${totalPages} (${users.length} users)`);
    page += 1;
  } while (page <= totalPages);

  const csvLines = ['firstName,lastName'];
  for (const row of rows) {
    csvLines.push(`${csvEscape(row.firstName)},${csvEscape(row.lastName)}`);
  }

  fs.writeFileSync(OUTPUT, `${csvLines.join('\n')}\n`, 'utf8');
  console.log(`Done. Exported ${rows.length} rows to ${OUTPUT}`);
}

run().catch((error) => {
  console.error('Export failed:', error.message);
  process.exit(1);
});
