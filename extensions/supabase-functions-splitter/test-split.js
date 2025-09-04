const fs = require('fs');
const path = require('path');

// Simulate the splitting logic for testing
function testSplitFunctions() {
    const functionsPath = '../../info/supabase/functions.json';
    const outputDir = './test_output';
    
    console.log('🧪 Testing Supabase Functions Splitter...\n');
    
    // Read functions file
    const fileContent = fs.readFileSync(functionsPath, 'utf8');
    const functions = JSON.parse(fileContent);
    
    console.log(`📄 Read ${functions.length} total functions`);
    
    // Group by schema
    const schemaGroups = {};
    functions.forEach(func => {
        if (!schemaGroups[func.schema_name]) {
            schemaGroups[func.schema_name] = [];
        }
        schemaGroups[func.schema_name].push(func);
    });
    
    console.log(`📊 Found ${Object.keys(schemaGroups).length} schemas:\n`);
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write split files and show results
    const createdFiles = [];
    Object.entries(schemaGroups).forEach(([schema, schemeFunctions]) => {
        const fileName = `functions_${schema}.json`;
        const filePath = path.join(outputDir, fileName);
        
        const fileData = {
            schema_name: schema,
            function_count: schemeFunctions.length,
            functions: schemeFunctions
        };
        
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
        createdFiles.push(fileName);
        
        console.log(`  ✅ ${schema}: ${schemeFunctions.length} functions → ${fileName}`);
    });
    
    // Create index file
    const indexData = {
        created_at: new Date().toISOString(),
        original_file: 'functions.json',
        total_functions: functions.length,
        schemas: Object.keys(schemaGroups).map(schema => ({
            schema_name: schema,
            function_count: schemaGroups[schema].length,
            file_name: `functions_${schema}.json`
        })),
        files_created: createdFiles
    };
    
    fs.writeFileSync(
        path.join(outputDir, 'index.json'),
        JSON.stringify(indexData, null, 2)
    );
    
    console.log(`\n📋 Created index.json with metadata`);
    console.log(`📁 All files created in: ${outputDir}/`);
    
    return { totalFunctions: functions.length, schemas: Object.keys(schemaGroups).length };
}

// Run test
try {
    const results = testSplitFunctions();
    console.log(`\n🎉 Test completed successfully!`);
    console.log(`   Total functions: ${results.totalFunctions}`);
    console.log(`   Schemas: ${results.schemas}`);
} catch (error) {
    console.error('❌ Test failed:', error.message);
}