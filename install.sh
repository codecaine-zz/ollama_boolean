#!/bin/bash
# install.sh - Installation script for Ollama Boolean Classification tool

set -e

REPO="yourusername/ollama_boolean"
INSTALL_DIR="/usr/local/bin"
BINARY_NAME="ollama_boolean"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Ollama Boolean Classification Tool Installer${NC}"
echo "=============================================="

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

echo "Detected OS: $OS"
echo "Detected Architecture: $ARCH"

# Determine binary name based on platform
case $OS in
  linux)
    if [[ $ARCH == "x86_64" ]]; then
      BINARY="ollama_boolean-linux-x64"
    else
      echo -e "${RED}Error: Unsupported architecture $ARCH for Linux${NC}"
      echo "Supported: x86_64"
      exit 1
    fi
    ;;
  darwin)
    if [[ $ARCH == "arm64" ]]; then
      BINARY="ollama_boolean-macos-arm64"
    elif [[ $ARCH == "x86_64" ]]; then
      BINARY="ollama_boolean-macos-x64"
    else
      echo -e "${RED}Error: Unsupported architecture $ARCH for macOS${NC}"
      echo "Supported: arm64, x86_64"
      exit 1
    fi
    ;;
  *)
    echo -e "${RED}Error: Unsupported OS: $OS${NC}"
    echo "Supported: linux, darwin (macOS)"
    echo "For Windows, please download the .exe from: https://github.com/$REPO/releases/latest"
    exit 1
    ;;
esac

echo "Target binary: $BINARY"

# Get latest release version
echo "Fetching latest release information..."
VERSION=$(curl -s https://api.github.com/repos/$REPO/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "")

if [[ -z "$VERSION" ]]; then
  echo -e "${RED}Error: Could not fetch latest release version${NC}"
  echo "Please check your internet connection and try again."
  exit 1
fi

echo "Latest version: $VERSION"

# Construct download URL
URL="https://github.com/$REPO/releases/download/$VERSION/$BINARY"
echo "Download URL: $URL"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
TEMP_FILE="$TEMP_DIR/$BINARY"

echo "Downloading $BINARY..."
if ! curl -L -o "$TEMP_FILE" "$URL"; then
  echo -e "${RED}Error: Failed to download binary${NC}"
  echo "Please check the URL and try again: $URL"
  exit 1
fi

# Verify download
if [[ ! -f "$TEMP_FILE" ]]; then
  echo -e "${RED}Error: Downloaded file not found${NC}"
  exit 1
fi

# Make executable
chmod +x "$TEMP_FILE"

# Test the binary
echo "Testing binary..."
if ! "$TEMP_FILE" --help > /dev/null; then
  echo -e "${RED}Error: Binary test failed${NC}"
  echo "The downloaded binary may be corrupted or incompatible."
  exit 1
fi

# Check if we need sudo for installation
if [[ ! -w "$INSTALL_DIR" ]]; then
  echo -e "${YELLOW}Note: Installing to $INSTALL_DIR requires sudo privileges${NC}"
  SUDO="sudo"
else
  SUDO=""
fi

# Install binary
echo "Installing to $INSTALL_DIR/$BINARY_NAME..."
if ! $SUDO mv "$TEMP_FILE" "$INSTALL_DIR/$BINARY_NAME"; then
  echo -e "${RED}Error: Failed to install binary${NC}"
  echo "You can manually copy the binary from: $TEMP_FILE"
  exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"

# Verify installation
if command -v "$BINARY_NAME" > /dev/null; then
  echo -e "${GREEN}✓ Installation successful!${NC}"
  echo ""
  echo "Usage:"
  echo "  $BINARY_NAME \"Your question here\""
  echo "  $BINARY_NAME --quiet \"Your question here\""
  echo "  $BINARY_NAME --help"
  echo ""
  echo "Example:"
  echo "  $BINARY_NAME \"Is the sky blue?\""
  echo ""
  echo "Requirements:"
  echo "  - Ollama running on http://localhost:11434"
  echo "  - At least one Ollama model installed (default: qwen3)"
  echo ""
  echo "Version installed: $VERSION"
else
  echo -e "${YELLOW}Warning: Installation completed but binary not found in PATH${NC}"
  echo "You may need to restart your shell or add $INSTALL_DIR to your PATH"
fi
