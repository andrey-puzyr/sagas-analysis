#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const SagaParser = require('./sagaParser');

const program = new Command();

program
  .name('saga-parser')
  .description('Parse ancient Icelandic saga HTML files to structured JSON')
  .version('1.0.0')
  .argument('<file>', 'HTML file to parse')
  .option('-o, --output <file>', 'Output JSON file (default: stdout)')
  .option('-p, --pretty', 'Pretty print JSON output')
  .action(async (file, options) => {
    try {
      // Validate input file
      if (!fs.existsSync(file)) {
        console.error(`Error: File '${file}' not found`);
        process.exit(1);
      }

      // Read HTML file
      const htmlContent = fs.readFileSync(file, 'utf8');
      
      // Parse saga
      const parser = new SagaParser();
      const result = parser.parse(htmlContent);
      
      // Format output
      const jsonOutput = options.pretty 
        ? JSON.stringify(result, null, 2)
        : JSON.stringify(result);
      
      // Output result
      if (options.output) {
        fs.writeFileSync(options.output, jsonOutput);
        console.log(`Output written to ${options.output}`);
      } else {
        console.log(jsonOutput);
      }
      
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();