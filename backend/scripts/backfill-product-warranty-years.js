#!/usr/bin/env node

const mongoose = require('mongoose');

async function backfillProductWarrantyYears({ dryRun = false } = {}) {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set. Please configure backend/.env or container env.');
  }

  await mongoose.connect(mongoUri);

  try {
    const collection = mongoose.connection.db.collection('products');

    const filter = {
      $or: [
        { warrantyDurationYears: { $exists: false } },
        { warrantyDurationYears: null },
        { warrantyDurationYears: { $type: 'string' } },
        { warrantyDurationYears: { $lt: 0 } },
      ],
    };

    const total = await collection.countDocuments(filter);
    console.log(`products_to_update=${total}`);

    if (dryRun || total === 0) {
      console.log(dryRun ? 'dry_run=true (no changes applied)' : 'no_changes_needed=true');
      return;
    }

    const result = await collection.updateMany(filter, {
      $set: { warrantyDurationYears: 0 },
    });

    console.log(`matched=${result.matchedCount ?? 0}`);
    console.log(`modified=${result.modifiedCount ?? 0}`);
    console.log('done=true');
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  await backfillProductWarrantyYears({ dryRun });
}

main().catch((error) => {
  console.error('backfill_failed=true');
  console.error(error?.message || error);
  process.exit(1);
});
