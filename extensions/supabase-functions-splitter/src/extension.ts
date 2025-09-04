import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface FunctionDefinition {
  schema_name: string;
  function_name: string;
  arguments: string;
  return_type: string;
  function_type: string;
  function_definition: string;
}

export function activate(context: vscode.ExtensionContext) {
  // Register split functions command
  const splitDisposable = vscode.commands.registerCommand(
    'supabase-functions-splitter.splitFunctions',
    async (uri: vscode.Uri) => {
      try {
        await splitFunctionsFile(uri);
        vscode.window.showInformationMessage('Functions successfully split by schema!');
      } catch (error) {
        vscode.window.showErrorMessage(`Error splitting functions: ${error}`);
      }
    }
  );

  // Register merge functions command
  const mergeDisposable = vscode.commands.registerCommand(
    'supabase-functions-splitter.mergeFunctions',
    async (uri: vscode.Uri) => {
      try {
        await mergeFunctionsFiles(uri);
        vscode.window.showInformationMessage('Schema files successfully merged back to functions.json!');
      } catch (error) {
        vscode.window.showErrorMessage(`Error merging functions: ${error}`);
      }
    }
  );

  context.subscriptions.push(splitDisposable, mergeDisposable);
}

async function splitFunctionsFile(uri: vscode.Uri) {
  const config = vscode.workspace.getConfiguration('supabaseFunctionsSplitter');
  const outputDir = config.get<string>('outputDirectory', 'functions_split');
  const filePrefix = config.get<string>('filePrefix', 'functions');

  // Read the functions.json file
  const fileContent = fs.readFileSync(uri.fsPath, 'utf8');
  const functions: FunctionDefinition[] = JSON.parse(fileContent);

  // Group functions by schema_name
  const schemaGroups: { [key: string]: FunctionDefinition[] } = {};

  functions.forEach(func => {
    if (!schemaGroups[func.schema_name]) {
      schemaGroups[func.schema_name] = [];
    }
    schemaGroups[func.schema_name].push(func);
  });

  // Create output directory
  const baseDir = path.dirname(uri.fsPath);
  const outputPath = path.join(baseDir, outputDir);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Write separate files for each schema
  const createdFiles: string[] = [];
  for (const [schemaName, schemeFunctions] of Object.entries(schemaGroups)) {
    const fileName = `${filePrefix}_${schemaName}.json`;
    const filePath = path.join(outputPath, fileName);

    const fileData = {
      schema_name: schemaName,
      function_count: schemeFunctions.length,
      functions: schemeFunctions
    };

    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    createdFiles.push(fileName);
  }

  // Create an index file with metadata
  const indexData = {
    created_at: new Date().toISOString(),
    original_file: path.basename(uri.fsPath),
    total_functions: functions.length,
    schemas: Object.keys(schemaGroups).map(schema => ({
      schema_name: schema,
      function_count: schemaGroups[schema].length,
      file_name: `${filePrefix}_${schema}.json`
    })),
    files_created: createdFiles
  };

  fs.writeFileSync(
    path.join(outputPath, 'index.json'),
    JSON.stringify(indexData, null, 2)
  );

  // Show results in output channel
  const outputChannel = vscode.window.createOutputChannel('Supabase Functions Splitter');
  outputChannel.clear();
  outputChannel.appendLine('=== Functions Split Summary ===');
  outputChannel.appendLine(`Total functions: ${functions.length}`);
  outputChannel.appendLine(`Schemas found: ${Object.keys(schemaGroups).length}`);
  outputChannel.appendLine('');

  Object.entries(schemaGroups).forEach(([schema, funcs]) => {
    outputChannel.appendLine(`${schema}: ${funcs.length} functions`);
  });

  outputChannel.appendLine('');
  outputChannel.appendLine('Files created:');
  createdFiles.forEach(file => outputChannel.appendLine(`- ${file}`));
  outputChannel.show();
}

async function mergeFunctionsFiles(uri: vscode.Uri) {
  const splitDir = path.dirname(uri.fsPath);
  const indexPath = path.join(splitDir, 'index.json');

  if (!fs.existsSync(indexPath)) {
    throw new Error('index.json not found. Cannot merge without metadata.');
  }

  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const allFunctions: FunctionDefinition[] = [];

  // Read all schema files
  for (const schemaInfo of indexData.schemas) {
    const schemaFilePath = path.join(splitDir, schemaInfo.file_name);

    if (!fs.existsSync(schemaFilePath)) {
      throw new Error(`Schema file not found: ${schemaInfo.file_name}`);
    }

    const schemaData = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
    allFunctions.push(...schemaData.functions);
  }

  // Write merged functions back to functions.json
  const baseDir = path.dirname(splitDir);
  const outputPath = path.join(baseDir, 'functions.json');

  fs.writeFileSync(outputPath, JSON.stringify(allFunctions, null, 2));

  // Show results
  const outputChannel = vscode.window.createOutputChannel('Supabase Functions Splitter');
  outputChannel.clear();
  outputChannel.appendLine('=== Functions Merge Summary ===');
  outputChannel.appendLine(`Total functions merged: ${allFunctions.length}`);
  outputChannel.appendLine(`Output file: functions.json`);
  outputChannel.show();
}

export function deactivate() { }