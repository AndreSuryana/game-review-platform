const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Read the config file
const configPath = path.resolve(__dirname, '../proto.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Construct the options dynamically
let options = '';
if (config.options) {
    options = Object.entries(config.options)
        .map(([key, value]) => {
            if (value == true) {
                return `--${key}=true`;
            } else if (value == false) {
                return `--${key}=false`;
            } else {
                return `--${key}=${value}`;
            }
        });
}

// Build the protoc command using the config
const protocCmd = `protoc --plugin=${config.plugin} --ts_proto_out=${config.outDir} ${config.protoFiles} ${options}`;
console.log(`Executing command: ${protocCmd}`);

// Run the build command
try {
    execSync(protocCmd);
    console.log('Proto files compiled successfully.')
} catch (error) {
    console.error('Error compiling proto files:', error);
    process.exit(1);
}