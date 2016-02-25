#!/usr/bin/env bash

git checkout gh-pages
git merge master
rm -rf public/*
node_modules/brunch/bin/brunch build
git add .
git commit . -m "compile public/"
git subtree push --prefix public origin gh-pages
git checkout master
