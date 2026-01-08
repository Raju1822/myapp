npm run build
cd ./build
git init
git checkout -b gh-pages
git remote add origin https://github.com/Raju1822/myapp.git
git add .
git commit -m "build and push to gh-pages"
git push -u origin gh-pages:gh-pages --force
cd ..
