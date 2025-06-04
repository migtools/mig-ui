#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error and exit
print_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Function to ensure directory is removed
ensure_removed() {
    local dir=$1
    local max_attempts=3
    local attempt=1

    while [ -d "$dir" ] && [ $attempt -le $max_attempts ]; do
        print_status "Attempt $attempt: Removing existing $dir directory"
        # Try to find and kill any processes using the directory
        lsof +D "$dir" 2>/dev/null | awk 'NR>1 {print $2}' | xargs -r kill -9 2>/dev/null || true
        # Force remove with sudo if available
        if command -v sudo &> /dev/null; then
            sudo rm -rf "$dir" 2>/dev/null || true
        else
            rm -rf "$dir" 2>/dev/null || true
        fi
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ -d "$dir" ]; then
        print_error "Failed to remove $dir after $max_attempts attempts. Directory info: $(ls -la "$dir")"
    fi
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        print_warning "Tests failed. Cleaning up..."
        docker rmi mig-ui:offline-test 2>/dev/null || true
    fi
}

# Set up cleanup trap
trap cleanup EXIT

echo "🧪 Testing offline yarn behavior"

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    print_error "yarn is not installed"
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    print_error "docker is not installed"
fi

# Clean up existing cache and node_modules
print_status "Cleaning up existing cache and modules"
print_status "Current directory contents before cleanup:"
ls -la

# First clean yarn cache
print_status "Cleaning yarn cache"
yarn cache clean
sleep 2  # Give yarn time to finish cleanup

# Now remove directories
ensure_removed ".yarn-cache"
ensure_removed "node_modules"
rm -f yarn.lock .yarnrc

# Create yarn cache directory
print_status "Creating .yarn-cache directory"
if [ -d ".yarn-cache" ]; then
    print_error ".yarn-cache directory still exists after cleanup. Directory info: $(ls -la .yarn-cache)"
fi
mkdir .yarn-cache || print_error "Failed to create .yarn-cache directory"

# Configure yarn for offline mirror using .yarnrc
print_status "Configuring yarn for offline mirror"
echo "yarn-offline-mirror \"$(pwd)/.yarn-cache\"" > .yarnrc || print_error "Failed to create .yarnrc"
echo "yarn-offline-mirror-pruning false" >> .yarnrc || print_error "Failed to update .yarnrc"

# Verify yarn config
print_status "Verifying yarn configuration"
if ! grep -q "yarn-offline-mirror" .yarnrc; then
    print_error "yarn offline mirror not configured correctly in .yarnrc"
fi

# First install to populate cache
print_status "Populating yarn cache with initial install"
yarn install --verbose || print_error "Initial yarn install failed"

# Verify cache was populated
print_status "Verifying cache contents"
CACHE_COUNT=$(ls -1 .yarn-cache 2>/dev/null | wc -l)
if [ "$CACHE_COUNT" -eq 0 ]; then
    print_error "yarn cache is empty after initial install"
else
    print_status "Found $CACHE_COUNT packages in cache"
    print_status "Cache contents:"
    ls -la .yarn-cache
fi

# Test offline install
print_status "Testing offline install"
yarn install --offline --verbose || print_error "Offline install failed"

# Test offline build
print_status "Testing offline build"
# Since we've already done an offline install, all dependencies should be cached
# We can just run the build script directly
yarn build || print_error "Build failed"

# Test docker build offline
print_status "Testing docker build offline"
docker build --network none -t mig-ui:offline-test . || print_error "Docker build failed"

# Verify the built image
print_status "Verifying built image"
if ! docker image inspect mig-ui:offline-test &> /dev/null; then
    print_error "Docker image was not built successfully"
fi

# Optional: Test running the container
print_status "Testing container runs"
if ! docker run --rm mig-ui:offline-test node --version &> /dev/null; then
    print_warning "Container test run failed"
fi

print_status "All offline tests completed successfully!" 