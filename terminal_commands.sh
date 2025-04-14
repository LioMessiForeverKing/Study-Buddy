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

# read the entire codebase very carefully and tell me features....thats already added and also give me a very good description of each feature added....