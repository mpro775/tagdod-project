Run once after clone:
```
npm run prepare
npx husky add .husky/commit-msg 'npx --no commitlint --edit "$1"'
```
