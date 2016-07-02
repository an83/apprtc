#!/bin/bash

echo building..
grunt build

echo deploying..
appcfg.py -A socialar-video-list update out/app_engine/app.yaml