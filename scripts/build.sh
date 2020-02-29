cd ..
rm -rf dist
npm run build

docker build . -f docker/Dockerfile
