# Installation Guide

## Option 1: Install from VSIX (Recommended)

1. Package the extension:
```bash
cd extensions/supabase-functions-splitter
npm install
npm run compile
vsce package
```

2. Install in VS Code:
- Open VS Code
- Press `Ctrl+Shift+P`
- Type "Extensions: Install from VSIX"
- Select the generated `.vsix` file

## Option 2: Development Installation

1. Open VS Code
2. Go to File → Open Folder
3. Open the `extensions/supabase-functions-splitter` folder
4. Press `F5` to launch Extension Development Host

## Usage

### Split Functions
1. Right-click on `functions.json` in Explorer
2. Select "Split Functions by Schema"
3. Files will be created in `functions_split/` directory

### Merge Back
1. Right-click on any split file (e.g., `functions_public.json`)
2. Select "Merge Schema Files Back"
3. Original `functions.json` will be recreated

## Benefits

- **Massive Token Savings**: Instead of loading all 63 functions (506 lines), work with focused files:
  - `functions_public.json`: 15 functions (~120 lines)
  - `functions_storage.json`: 23 functions (~180 lines)
  - `functions_graphql.json`: 6 functions (~50 lines)
  
- **Better Organization**: Functions logically grouped by database schema
- **Reversible**: Always merge back to original format when needed
- **Safe**: Original file preserved, split files in separate directory

## File Structure After Splitting

```
info/supabase/
├── functions.json (original - 506 lines, ~8000 tokens)
└── functions_split/
    ├── index.json (metadata - 51 lines, ~800 tokens)
    ├── functions_public.json (15 functions - ~120 lines, ~1900 tokens)
    ├── functions_storage.json (23 functions - ~180 lines, ~2800 tokens)
    ├── functions_graphql.json (6 functions - ~50 lines, ~800 tokens)
    ├── functions_realtime.json (12 functions - ~100 lines, ~1600 tokens)
    ├── functions_vault.json (5 functions - ~40 lines, ~600 tokens)
    ├── functions_pgbouncer.json (1 function - ~8 lines, ~120 tokens)
    └── functions_graphql_public.json (1 function - ~8 lines, ~120 tokens)
```

This gives you **80-90% token reduction** when working with specific schemas!