#!/bin/bash

echo "> Starting stripe webhook listener"
export STRIPE_WEBHOOK_SIGNING_SECRET=$(stripe --api-key $STRIPE_WEBHOOK_KEY listen --forward-connect-to localhost:3060/webhooks/stripe --print-secret)
stripe --api-key $STRIPE_WEBHOOK_KEY listen --forward-connect-to localhost:3060/webhooks/stripe >/dev/null &
STRIPE_WEBHOOK_PID=$!

echo "> Starting api server"
if [ -z "$API_FOLDER" ]; then
  cd ~/api
else
  cd $API_FOLDER
fi
PG_DATABASE=opencollective_dvl MAILPIT_CLIENT=true npm run start:e2e:server &
API_PID=$!
echo "> Starting mailpit server"
npm run mailpit &
MAILPIT_PID=$!
cd -

echo "> Starting frontend server"
if [ -z "$FRONTEND_FOLDER" ]; then
  cd ~/frontend
else
  cd $FRONTEND_FOLDER
fi
npm run start:ci &
FRONTEND_PID=$!
cd -

echo "> Starting images server"
if [ -z "$IMAGES_FOLDER" ]; then
  cd ~/images
else
  cd $IMAGES_FOLDER
fi
npm start &
IMAGES_PID=$!
cd -

echo "> Starting PDF server"
if [ -z "$PDF_FOLDER" ]; then
  cd ~/pdf
else
  cd $PDF_FOLDER
fi
PORT=3002 OPENSSL_CONF=/dev/null npm start &
PDF_PID=$!
cd -

# Set `$CYPRESS_RECORD` to `true` in ENV to activate records
if [ "$CYPRESS_RECORD" = "true" ]; then
  CYPRESS_RECORD="--record"
else
  CYPRESS_RECORD="--record false"
fi

# Set `$CYPRESS_VIDEO` to `false` in ENV to de-activate videos recording.
# See https://docs.cypress.io/guides/references/configuration.html#Videos

# Wait for a service to be up
function wait_for_service() {
  echo "> Waiting for $1 to be ready... "
  while true; do
    nc -z "$2" "$3"
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
      echo "> Application $1 is up!"
      break
    fi
    sleep 1
  done
}

echo ""
wait_for_service MAILDEV 127.0.0.1 1080
echo ""
wait_for_service API 127.0.0.1 3060
echo ""
wait_for_service Frontend 127.0.0.1 3000
echo ""
wait_for_service IMAGES 127.0.0.1 3001
echo ""
wait_for_service PDF 127.0.0.1 3002

echo ""

if [ "$USE_PLAYWRIGHT" = "true" ]; then
  echo "> Running playwright tests"
  pwd
  ls
  ls test
  ls test/playwright
  ls test/playwright/integration
  npx playwright test test/playwright/integration/*.spec.ts
else
  echo "> Running cypress tests"
  npm run cypress:run -- ${CYPRESS_RECORD} --browser chromium --env OC_ENV=$OC_ENV --spec "test/cypress/integration/${CYPRESS_TEST_FILES}"
fi

RETURN_CODE=$?
if [ $RETURN_CODE -ne 0 ]; then
  echo "Error with cypress e2e tests, exiting"
  exit 1
fi
echo ""

echo "Killing all node processes"
kill $MAILDEV_PID
kill $STRIPE_WEBHOOK_PID
kill $API_PID
kill $FRONTEND_PID
kill $IMAGES_PID
kill $PDF_PID

echo "Exiting with code $RETURN_CODE"
exit $RETURN_CODE
