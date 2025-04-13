# Stop the dev server if running
# Then run these commands:
rm -rf .next
npm run build
npm run dev

git branch -d <branch-name>
git checkout <branch-name>
git branch <branch-name>

rm -rf .next
rm -rf node_modules
npm install