cd ..
npm install
npm run build

cd docker
docker-compose build --no-cache

rm -rf ../dist
