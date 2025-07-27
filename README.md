# ollama_boolean

A console application that uses Ollama to classify text prompts into binary or ternary responses.

## Quick Start

### Download Pre-built Binaries (Recommended)

**[📥 Download Latest Release](https://github.com/codecaine-zz/ollama_boolean/releases/latest)**

**Supported Platforms:**

- Linux (x64): `ollama_boolean-linux-x64`
- Windows (x64): `ollama_boolean-windows-x64.exe`
- macOS Intel: `ollama_boolean-macos-x64`
- macOS Apple Silicon: `ollama_boolean-macos-arm64`

**Quick Install (Linux/macOS):**

```bash
# One-line installer
curl -sSL https://raw.githubusercontent.com/codecaine-zz/ollama_boolean/main/install.sh | bash

# Or manual download
curl -L -o ollama_boolean https://github.com/codecaine-zz/ollama_boolean/releases/latest/download/ollama_boolean-linux-x64
chmod +x ollama_boolean
sudo mv ollama_boolean /usr/local/bin/
```

**Windows:**

```powershell
# Download from releases page
Invoke-WebRequest -Uri "https://github.com/codecaine-zz/ollama_boolean/releases/latest/download/ollama_boolean-windows-x64.exe" -OutFile "ollama_boolean.exe"
```

### Or Build from Source

## Installation

To install dependencies:

```bash
bun install
```

## Compilation to Binary

You can compile the script to a standalone binary executable:

```bash
# Using npm script (recommended)
bun run build

# Or directly with bun build
bun build --compile --outfile ollama_boolean index.ts

# This creates an executable named 'ollama_boolean' in the current directory
```

### Cross-Platform Compilation

Build for different platforms:

```bash
# Build for current platform
bun run build

# Build for Windows
bun run build:win

# Build for Linux
bun run build:linux

# Build for macOS
bun run build:mac
```

### Using the Compiled Binary

Once compiled, you can run the binary directly without needing Bun installed:

```bash
# Verbose mode
./ollama_boolean "Is the sky blue?"

# Quiet mode
./ollama_boolean --quiet "Can pigs fly?"

# With custom model
./ollama_boolean "Is this art beautiful?" llama3.2

# Show help
./ollama_boolean --help
```

### Distribution

The compiled binary is self-contained and can be:
- Copied to other machines with the same architecture
- Added to your PATH for global access
- Distributed without requiring Bun or Node.js installation

```bash
# Example: Copy to /usr/local/bin for global access (macOS/Linux)
sudo cp ollama_boolean /usr/local/bin/
```

## Usage

The app classifies user prompts and returns:

- `1` for Yes/Positive answers
- `0` for No/Negative answers  
- `2` for Unknown/Subjective answers

### Basic Usage

```bash
bun run index.ts "<your_prompt>"
```

### With Custom Model

```bash
bun run index.ts "<your_prompt>" <model_name>
```

### Quiet Mode (Number Only)

For scripts or when you only need the raw classification number:

```bash
bun run index.ts --quiet "<your_prompt>"
bun run index.ts -q "<your_prompt>" <model_name>
```

### Examples

```bash
# Verbose output (default)
bun run index.ts "Is the sky blue?"
# Output:
# Prompt: "Is the sky blue?"
# Model: qwen3
# Classifying...
# 
# Result: 1
# Interpretation: Yes/Positive

# Quiet mode - only returns the number
bun run index.ts --quiet "Is the sky blue?"
# Output: 1

# Using a specific model with quiet mode
bun run index.ts -q "Can pigs fly?" llama3.2
# Output: 0

# Subjective question
bun run index.ts "Is this painting beautiful?"
# Output: 2 (with full interpretation in verbose mode)
```

### Help

```bash
bun run index.ts --help
```

## Requirements

- [Bun](https://bun.com) runtime
- [Ollama](https://ollama.ai) running locally on port 11434
- At least one Ollama model installed (default: qwen3)

## Model Setup

Make sure you have Ollama running and the desired model installed:

```bash
# Install and run Ollama
ollama pull qwen3
ollama serve
```

This project was created using `bun init` in bun v1.2.19.

## Testing

The project includes comprehensive Bun tests covering:

### Run Tests

```bash
# Run all tests
bun test

# Run tests with a timeout of 3000ms
bun test --timeout 3000

# Run tests in watch mode (re-run on file changes)
bun run test:watch

# Run tests with coverage report
bun run test:coverage
```

### Test Coverage

The test suite covers:

- **CLI Interface**: Help commands, argument parsing, error handling
- **Input Validation**: Empty prompts, special characters, edge cases
- **Response Validation**: JSON parsing, result validation, error scenarios
- **Performance**: Argument parsing efficiency, long prompts
- **Binary Compilation**: Successful compilation verification

### Test Categories

- **Unit Tests**: Core logic and validation functions
- **Integration Tests**: CLI interface and argument handling
- **Performance Tests**: Efficiency and edge case handling
- **Compilation Tests**: Binary build verification

The tests are designed to run without requiring Ollama to be running, using mocked responses and logic validation where appropriate.
