# Supabase Functions Splitter

A VS Code extension to split large Supabase `functions.json` files into smaller, schema-organized files for better token usage and organization.

## Features

- **Split by Schema**: Automatically splits `functions.json` into separate files organized by `schema_name`
- **Smart Naming**: Creates files like `functions_public.json`, `functions_graphql.json`, etc.
- **Merge Back**: Reconstruct the original `functions.json` from split files
- **Context Menu Integration**: Right-click on `functions.json` to split, or on split files to merge back
- **Detailed Reports**: Shows splitting/merging summary in output channel

## Usage

Once installed, the extension provides context menu options for splitting and merging Supabase functions files.

### Splitting Functions

1. Right-click on any `functions.json` file in the Explorer
2. Select "Split Functions by Schema" from the context menu
3. Files will be created in a `functions_split/` directory
4. Check the Output panel (View → Output → Supabase Functions Splitter) for detailed splitting report

### Merging Back

1. Right-click on any split file (e.g., `functions_public.json`) 
2. Select "Merge Schema Files Back" from the context menu
3. Original `functions.json` will be recreated
4. Check the Output panel for detailed merging report

### Extension Activation

The extension automatically activates when you:
- Open a workspace containing `functions.json` files
- Right-click on any `.json` file in the explorer

## Configuration

- `supabaseFunctionsSplitter.outputDirectory`: Directory for split files (default: "functions_split")
- `supabaseFunctionsSplitter.filePrefix`: Prefix for split filenames (default: "functions")

## File Structure After Splitting

```
info/supabase/
├── functions.json (original)
└── functions_split/
    ├── index.json (metadata)
    ├── functions_public.json
    ├── functions_graphql.json
    ├── functions_storage.json
    └── ... (one file per schema)
```

## Benefits

- **Token Optimization**: Work with smaller, focused files
- **Better Organization**: Functions grouped by logical schema
- **Reversible**: Always merge back to original format
- **Safe**: Original file preserved, split files in separate directory

## Installation

### From VSIX Package

1. Download the `.vsix` file from the releases
2. Open VS Code
3. Go to Extensions view (Ctrl+Shift+X)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file
6. Reload VS Code when prompted

### From Source

Clone the repository and install from source for development.

## Requirements

- VS Code 1.74.0 or higher
- Node.js for development/compilation

## Development

```bash
npm install
npm run compile
```

Use F5 to launch extension development host.