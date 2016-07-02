#!/bin/bash

echo building..
grunt build

echo deploying..
appcfg.py -A socialar-video update out/app_engine/app.yaml