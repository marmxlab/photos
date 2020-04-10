if [ "$1" == "" ]; then
  echo "You must specify the tag name for the docker image."
  exit 1
fi

cd ..
rm -rf dist
npm run build

docker build . -f docker/Dockerfile -t $1


read -p "Do you want to docker push the image? " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo "Docker pushing $1 ..."
docker push $1
