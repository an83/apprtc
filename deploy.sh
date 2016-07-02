#!/bin/bash

echo building..
grunt build

echo deploying..
appcfg.py -A socialar-list update out/app_engine/app.yaml