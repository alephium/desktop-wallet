#!/usr/bin/env bash
rm -rf build
INLINE_RUNTIME_CHUNK=false npm run-script build
cp -R background.js icons manifest.json build
