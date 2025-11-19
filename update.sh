#!/bin/bash

set -e

echo "Updating Dash source:"

cd "$(dirname "$0")"

echo "Removing old source directory..."
rm -rf source

echo "Cloning desktop build from GitHub..."
git clone --branch desktop-build https://github.com/DashBlocks/scratch-gui.git temp-source

rm -rf temp-source/.git

echo "Installing new source..."
mv temp-source source

echo "Update complete!"
echo "Run 'npm start' to launch the updated app."