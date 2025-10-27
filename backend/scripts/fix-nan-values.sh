#!/bin/bash

echo "========================================"
echo "Fix NaN Stock Values Script"
echo "========================================"
echo ""
echo "This script will fix NaN values in the variants collection."
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Navigate to backend directory
cd "$(dirname "$0")/.." || exit

# Run the TypeScript script
npx ts-node scripts/fix-nan-stock-values.ts

echo ""
echo "Script completed!"

