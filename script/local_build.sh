PROJECT=docker-sharp-image-server
BRANCH=master
BUILD_NUMBER=1.0.0
AWSID=$AWSID
AWSREGION=eu-west-1
EC2=designreact

echo $PROJECT.$BRANCH.$BUILD_NUMBER

npm run build
npm run ship
ls -al dist

echo $PROJECT.$BRANCH.$BUILD_NUMBER

sudo docker build -t docker-sharp-image-server:$PROJECT.$BRANCH.$BUILD_NUMBER .
sudo docker tag docker-sharp-image-server:$PROJECT.$BRANCH.$BUILD_NUMBER $AWSID.dkr.ecr.$AWSREGION.amazonaws.com/$EC2:$PROJECT.$BRANCH.$BUILD_NUMBER
sudo docker push $AWSID.dkr.ecr.$AWSREGION.amazonaws.com/$EC2:$PROJECT.$BRANCH.$BUILD_NUMBER
