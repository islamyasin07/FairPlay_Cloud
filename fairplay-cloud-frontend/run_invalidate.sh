#!/bin/bash
source /home/ec2-user/fairplay-backend/.env
TS=$(date +%s)
aws cloudfront create-invalidation --distribution-id EPV7UPFI7XFYK --invalidation-batch "{\"Paths\":{\"Quantity\":1,\"Items\":[\"/*\"]},\"CallerReference\":\"deploy-$TS\"}"
