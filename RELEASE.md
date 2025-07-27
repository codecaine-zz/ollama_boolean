# Release Guide for Ollama Boolean Classification Tool

This document provides instructions for creating and managing releases of the Ollama Boolean Classification tool.

## Overview

The project uses GitHub Actions to automatically build cross-platform binaries and create releases when version tags are pushed.

## Supported Platforms

- **Linux (x64)**: `ollama_boolean-linux-x64`
- **Windows (x64)**: `ollama_boolean-windows-x64.exe`
- **macOS Intel (x64)**: `ollama_boolean-macos-x64`
- **macOS Apple Silicon (ARM64)**: `ollama_boolean-macos-arm64`

## Creating a New Release

### 1. Prepare the Release

```bash
# Ensure all tests pass and build all platforms locally
bun run release:prepare

# Clean up any existing binaries
bun run clean
```

### 2. Update Version

Update the version in `package.json`:

```json
{
  "version": "1.1.0"
}
```

### 3. Commit and Tag

```bash
# Commit version changes
git add package.json
git commit -m "Bump version to v1.1.0"

# Create and push tag
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

### 4. Automated Release

The GitHub Actions workflow will automatically:

1. **Build** cross-platform binaries for all supported platforms
2. **Test** the code on each platform
3. **Create** a GitHub release with all binaries
4. **Upload** binaries as release assets

## Manual Release (Alternative)

If you prefer to create releases manually:

### 1. Build All Platforms

```bash
# Build all platform binaries
bun run build:all

# Verify binaries were created
ls -la ollama_boolean*
```

### 2. Test Binaries

```bash
# Test each binary (on appropriate platforms)
./ollama_boolean --help
./ollama_boolean.exe --help                    # Windows
./ollama_boolean-arm64 --help                  # macOS ARM64
```

### 3. Create Release Manually

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Choose or create a tag (e.g., `v1.1.0`)
4. Fill in release title and description
5. Upload all binary files
6. Publish the release

## Release Checklist

Before creating a release, ensure:

- [ ] All tests pass (`bun test`)
- [ ] Version is updated in `package.json`
- [ ] CHANGELOG.md is updated (if you have one)
- [ ] README.md reflects any new features
- [ ] All platforms build successfully
- [ ] Binaries are tested on target platforms

## Release Naming Convention

Use semantic versioning (SemVer):

- **Major version** (v2.0.0): Breaking changes
- **Minor version** (v1.1.0): New features, backward compatible
- **Patch version** (v1.0.1): Bug fixes, backward compatible

## Binary Naming Convention

- Linux: `ollama_boolean-linux-x64`
- Windows: `ollama_boolean-windows-x64.exe`
- macOS Intel: `ollama_boolean-macos-x64`
- macOS ARM64: `ollama_boolean-macos-arm64`

## Deployment and Distribution

### Direct Download

Users can download binaries directly from GitHub releases:

```bash
# Example download URLs (replace with actual release version)
wget https://github.com/yourusername/ollama_boolean/releases/download/v1.0.0/ollama_boolean-linux-x64
curl -L -o ollama_boolean.exe https://github.com/yourusername/ollama_boolean/releases/download/v1.0.0/ollama_boolean-windows-x64.exe
```

### Installation Script

You could create an installation script:

```bash
#!/bin/bash
# install.sh
REPO="yourusername/ollama_boolean"
VERSION=$(curl -s https://api.github.com/repos/$REPO/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $OS in
  linux)
    BINARY="ollama_boolean-linux-x64"
    ;;
  darwin)
    if [[ $ARCH == "arm64" ]]; then
      BINARY="ollama_boolean-macos-arm64"
    else
      BINARY="ollama_boolean-macos-x64"
    fi
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

URL="https://github.com/$REPO/releases/download/$VERSION/$BINARY"
curl -L -o ollama_boolean "$URL"
chmod +x ollama_boolean
echo "Downloaded ollama_boolean $VERSION for $OS/$ARCH"
```

## Troubleshooting

### Build Failures

If GitHub Actions builds fail:

1. Check the Actions tab in your repository
2. Review build logs for errors
3. Test builds locally with `bun run build:all`
4. Ensure all dependencies are properly listed

### Binary Issues

If binaries don't work on target platforms:

1. Verify the correct Bun targets are used
2. Test on actual target platforms
3. Check for missing system dependencies
4. Ensure binaries have execute permissions (Linux/macOS)

### Release Creation Failures

If automatic release creation fails:

1. Check repository permissions
2. Verify the tag format matches the workflow trigger
3. Ensure secrets and tokens are properly configured
4. Try creating a release manually as a workaround

## GitHub Actions Configuration

The release workflow is defined in `.github/workflows/release.yml` and:

- Triggers on version tags (`v*`)
- Builds on multiple OS runners
- Runs tests before building
- Creates binaries for all platforms
- Automatically creates GitHub releases
- Uploads all binaries as release assets

For more details, see the workflow file in the repository.
