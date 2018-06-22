#!/bin/bash

showUsage () { echo "$1 \n Usage: install -e dev -v e74c884  "; echo; }

# Use -gt 1 to consume two arguments per pass in the loop (e.g. each
# argument has a corresponding value to go with it).
# Use -gt 0 to consume one or more arguments per pass in the loop (e.g.
# some arguments don't have a corresponding value to go with it such
# as in the --default example).
# note: if this is set to -gt 0 the /etc/hosts part is not recognized ( may be a bug )
while [ $# -gt 1 ]
do
key="$1"
case $key in
    -e|--env)
    ENV="$2"
    shift # past argument
    ;;
    -p|--package)
    PKG="$2"
    shift # past argument
    ;;
    *)
    # unknown option
    ;;
esac
shift # past argument or value
done

if [ -z "$ENV" ]
then
    showUsage 'Environment not specified'
    exit 1
fi

if [ -z "$PKG" ]
then
    showUsage 'Deployment package not specified'
    exit 1
fi

case $ENV in
    dev|DEV)
    DEST="s3://cgs-web/esante/insights/dev"
    ;;
    qa|QA)
    DEST="s3://cgs-web/esante/insights/qa"
    ;;
    stage|STAGE)
    DEST="s3://cgs-web/esante/insights/stage"
    ;;
    *)
    echo "Unknown environment $ENV"
    exit 2
    ;;
esac


ARTIFACT="s3://cgs-artifacts/esante/hie/datavis/$PKG"
echo "Downloading deployment package from $ARTIFACT ..."
aws s3 cp $ARTIFACT _deploy_package.zip
echo "Decompressing deployment package ... "
unzip -o _deploy_package.zip
ls -al
mv ./build/config-$ENV.json ./build/config-app.json
echo "Deploying to $ENV -> $DEST ..."
aws s3 sync ./build $DEST --delete

#TODO: run terraform to create cloudfront distribution and R53 entries
echo "Installing terraform ..."
cd ./infrastructure
aws s3 cp s3://cognosante-software/terraform/terraform_linux_amd64.zip ./terraform.zip
unzip -o ./terraform.zip
./terraform init
echo "Preparing terraform for environment $ENV ..."
./terraform env new $ENV
./terraform env select $ENV
echo "Fetching current infrastructure state ..."
./terraform state pull
echo "Ensuring infrastructure [$ENV] ..."
./terraform plan