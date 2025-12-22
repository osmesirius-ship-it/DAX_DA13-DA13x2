#!/bin/bash

# DAX DA13-DA13x2 System Startup Script
echo "Starting DAX Governance System..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please copy .env.example to .env and configure your API keys."
    exit 1
fi

# Load environment variables (skip comments)
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    echo "Environment variables loaded."
else
    echo "Warning: .env file not found. Please copy .env.example to .env and configure."
fi

# Create required directories if they don't exist
mkdir -p data/beliefs logs temp
echo "Directories verified/created."

# Install dependencies if node_modules doesn't exist
if [ ! -d "mcp/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    cd mcp && npm install && cd ..
fi

# Compile TypeScript
echo "Compiling TypeScript..."
cd mcp
if npm run build &> /dev/null; then
    echo "TypeScript compilation completed."
elif command -v npx &> /dev/null; then
    npx tsc
    echo "TypeScript compilation completed with npx."
else
    echo "Error: TypeScript compilation failed. Please ensure npm or npx is available."
    cd ..
    exit 1
fi

# Start MCP server
echo "Starting DAX MCP Server..."
if [ -f "dist/index.js" ]; then
    node dist/index.js
else
    echo "Error: Compiled mcp/dist/index.js not found. Compilation may have failed."
    cd ..
    exit 1
fi
