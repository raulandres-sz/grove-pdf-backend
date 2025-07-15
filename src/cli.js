#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const program = new Command();

program
  .name('grove-pdf')
  .description('CLI tool for generating custom Grove PDF files')
  .version('1.0.0');

// Common options for all commands
const addCommonOptions = (command) => {
  return command
    .option('-d, --domain <domain>', 'Domain for the QR code', 'grove.xiber.net')
    .option('-o, --output <file>', 'Output file name', 'grove-output.pdf')
    .option('--url <url>', 'Custom service URL', 'http://127.0.0.1:4002');
};

// Helper function to make HTTP requests
function makeRequest(url, method, postData = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const httpClient = isHttps ? https : http;
    
    const options = new URL(url);
    options.method = method;
    
    if (method === 'POST' && postData) {
      options.headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      };
    }

    const req = httpClient.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        
        if (res.statusCode >= 400) {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
        } else if (res.headers['content-type']?.includes('application/json')) {
          resolve(JSON.parse(body.toString()));
        } else {
          resolve(body);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST' && postData) {
      req.write(postData);
    }
    req.end();
  });
}

// GET command - legacy format
program
  .command('get')
  .description('Generate PDF using a GET request (legacy format)')
  .option('-s, --included-speed <speed>', 'Included speed', '400/400')
  .option('-u, --included-units <units>', 'Included speed units', 'MBPS')
  .option('--speed1 <speed>', 'Additional speed 1')
  .option('--units1 <units>', 'Additional speed 1 units')
  .option('--price1 <price>', 'Additional speed 1 price')
  .option('--speed2 <speed>', 'Additional speed 2')
  .option('--units2 <units>', 'Additional speed 2 units')
  .option('--price2 <price>', 'Additional speed 2 price')
  .option('--speed3 <speed>', 'Additional speed 3')
  .option('--units3 <units>', 'Additional speed 3 units')
  .option('--price3 <price>', 'Additional speed 3 price')
  .option('--tvTitle1 <title>', 'TV Option 1 Title')
  .option('--tvSubtitle1 <subtitle>', 'TV Option 1 Subtitle')
  .option('--tvAmount1 <amount>', 'TV Option 1 Price')
  .option('--tvTitle2 <title>', 'TV Option 2 Title')
  .option('--tvSubtitle2 <subtitle>', 'TV Option 2 Subtitle')
  .option('--tvAmount2 <amount>', 'TV Option 2 Price')
  .option('--tvTitle3 <title>', 'TV Option 3 Title')
  .option('--tvSubtitle3 <subtitle>', 'TV Option 3 Subtitle')
  .option('--tvAmount3 <amount>', 'TV Option 3 Price');

addCommonOptions(program.commands[0]);

program.commands[0].action(async (options) => {
  try {
    console.log('Generating PDF via GET request...');
    
    // Construct query parameters
    const params = new URLSearchParams();
    params.append('domain', options.domain);
    params.append('includedSpeed', options.includedSpeed);
    params.append('includedUnits', options.includedUnits);
    
    // Add additional speeds if provided
    for (let i = 1; i <= 3; i++) {
      if (options[`speed${i}`]) {
        params.append(`speed${i}`, options[`speed${i}`]);
        params.append(`units${i}`, options[`units${i}`] || 'GBPS');
        params.append(`price${i}`, options[`price${i}`] || '25');
      }
    }
    
    // Add TV options if provided
    for (let i = 1; i <= 3; i++) {
      if (options[`tvTitle${i}`]) {
        params.append(`tvTitle${i}`, options[`tvTitle${i}`]);
        params.append(`tvSubtitle${i}`, options[`tvSubtitle${i}`] || '');
        params.append(`tvAmount${i}`, options[`tvAmount${i}`] || '15');
      }
    }
    
    const url = `${options.url}/generate-pdf?${params.toString()}`;
    const pdfBuffer = await makeRequest(url, 'GET');
    
    fs.writeFileSync(options.output, pdfBuffer);
    console.log(`PDF saved to ${options.output}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
});

// New command for new format
program
  .command('create')
  .description('Generate PDF using the new data format')
  .option('--incSpeed <speed>', 'Included speed', '400')
  .option('--incUnits <units>', 'Included speed units', 'Mbps')
  .option('--addSpeed1 <speed>', 'Additional speed 1')
  .option('--addUnits1 <units>', 'Additional speed 1 units', 'Mbps')
  .option('--addPrice1 <price>', 'Additional speed 1 price', '15')
  .option('--addSpeed2 <speed>', 'Additional speed 2')
  .option('--addUnits2 <units>', 'Additional speed 2 units', 'Gbps')
  .option('--addPrice2 <price>', 'Additional speed 2 price', '25')
  .option('--tvTitle1 <title>', 'TV Package 1 Title')
  .option('--tvSubtitle1 <subtitle>', 'TV Package 1 Subtitle')
  .option('--tvAmount1 <amount>', 'TV Package 1 Price')
  .option('--tvTitle2 <title>', 'TV Package 2 Title')
  .option('--tvSubtitle2 <subtitle>', 'TV Package 2 Subtitle')
  .option('--tvAmount2 <amount>', 'TV Package 2 Price')
  .option('--addonTitle <title>', 'TV Addon Title')
  .option('--addonSubtitle <subtitle>', 'TV Addon Subtitle')
  .option('--addonAmount <amount>', 'TV Addon Price');

addCommonOptions(program.commands[1]);

program.commands[1].action(async (options) => {
  try {
    console.log('Generating PDF with new format...');
    
    // Construct data in new format
    const postData = {
      domain: options.domain,
      speeds: [
        {
          speed: options.incSpeed,
          units: options.incUnits,
          included: true
        }
      ],
      tv: [],
      tv_addons: []
    };
    
    // Add additional speeds if provided
    if (options.addSpeed1) {
      postData.speeds.push({
        speed: options.addSpeed1,
        units: options.addUnits1,
        price: Number(options.addPrice1)
      });
    }
    
    if (options.addSpeed2) {
      postData.speeds.push({
        speed: options.addSpeed2,
        units: options.addUnits2,
        price: Number(options.addPrice2)
      });
    }
    
    // Add TV packages if provided (max 2)
    if (options.tvTitle1) {
      postData.tv.push({
        title: options.tvTitle1,
        subtitle: options.tvSubtitle1 || '',
        amount: options.tvAmount1 || '39.99'
      });
    }
    
    if (options.tvTitle2) {
      postData.tv.push({
        title: options.tvTitle2,
        subtitle: options.tvSubtitle2 || '',
        amount: options.tvAmount2 || '45.99'
      });
    }
    
    // Add TV addon if provided
    if (options.addonTitle) {
      postData.tv_addons.push({
        title: options.addonTitle,
        subtitle: options.addonSubtitle || '',
        amount: options.addonAmount || '15'
      });
    }
    
    const url = `${options.url}/generate-pdf`;
    const pdfBuffer = await makeRequest(url, 'POST', JSON.stringify(postData));
    
    fs.writeFileSync(options.output, pdfBuffer);
    console.log(`PDF saved to ${options.output}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
});

// New command for products format
program
  .command('products')
  .description('Generate PDF using the products data format from test.json')
  .option('--incSpeed <speed>', 'Included speed', '250/250')
  .option('--incUnits <units>', 'Included speed units', 'Mbps')
  .option('--incTitle <title>', 'Included speed title', '250/250 Mbps')
  .option('--incSubtitle <subtitle>', 'Included speed subtitle', 'Synchronous Speeds (Upload & Download)')
  .option('--addSpeed1 <speed>', 'Additional speed 1', '500')
  .option('--addUnits1 <units>', 'Additional speed 1 units', 'Mbps')
  .option('--addPrice1 <price>', 'Additional speed 1 price', '15')
  .option('--addTitle1 <title>', 'Additional speed 1 title', '500 Mbps Internet')
  .option('--addSync1 <sync>', 'Additional speed 1 is synchronous', 'true')
  .option('--addServiceID1 <id>', 'Additional speed 1 service ID', '215')
  .option('--addSpeed2 <speed>', 'Additional speed 2', '1')
  .option('--addUnits2 <units>', 'Additional speed 2 units', 'Gbps')
  .option('--addPrice2 <price>', 'Additional speed 2 price', '25')
  .option('--addTitle2 <title>', 'Additional speed 2 title', '1 Gbps Internet Upgrade')
  .option('--addSync2 <sync>', 'Additional speed 2 is synchronous', 'true')
  .option('--addServiceID2 <id>', 'Additional speed 2 service ID', '219')
  .option('--tvTitle1 <title>', 'TV Package 1 Title', 'Xiber TV Gold (120+ channels)')
  .option('--tvSubtitle1 <subtitle>', 'TV Package 1 Subtitle', '150+ Channels')
  .option('--tvAmount1 <amount>', 'TV Package 1 Price', '62.99')
  .option('--tvService1 <id>', 'TV Package 1 Service ID', '194674')
  .option('--tvTitle2 <title>', 'TV Package 2 Title', 'Xiber TV Platinum (150+ channels)')
  .option('--tvSubtitle2 <subtitle>', 'TV Package 2 Subtitle', '150+ Channels')
  .option('--tvAmount2 <amount>', 'TV Package 2 Price', '74.99')
  .option('--tvService2 <id>', 'TV Package 2 Service ID', '194675');

addCommonOptions(program.commands[2]);

program.commands[2].action(async (options) => {
  try {
    console.log('Generating PDF with products format...');
    
    // Construct data in products format
    const postData = {
      domain: options.domain,
      products: {
        internet: [
          {
            included: true,
            speed: options.incSpeed,
            units: options.incUnits,
            title: options.incTitle,
            subtitle: options.incSubtitle
          },
          {
            serviceID: options.addServiceID1,
            amount: parseInt(options.addPrice1, 10) || 15,
            title: options.addTitle1,
            speed: options.addSpeed1,
            units: options.addUnits1,
            sync: options.addSync1 === 'true',
            subtitle: 'Synchronous Speeds (Upload & Download)'
          },
          {
            serviceID: options.addServiceID2,
            amount: parseInt(options.addPrice2, 10) || 25,
            title: options.addTitle2,
            speed: options.addSpeed2,
            units: options.addUnits2,
            sync: options.addSync2 === 'true',
            subtitle: 'Synchronous Speeds (Upload & Download)'
          }
        ],
        tv: [
          {
            serviceID: parseInt(options.tvService1, 10) || 194674,
            title: options.tvTitle1,
            subtitle: options.tvSubtitle1,
            link_learnmore: "https://xiber.com/xibertv/channels/#tab-3:",
            amount: options.tvAmount1
          },
          {
            serviceID: parseInt(options.tvService2, 10) || 194675,
            title: options.tvTitle2,
            subtitle: options.tvSubtitle2,
            link_learnmore: "https://xiber.com/xibertv/channels/#tab-3:",
            amount: options.tvAmount2
          }
        ],
        tv_addons: []
      }
    };
    
    const url = `${options.url}/generate-pdf`;
    
    try {
      const pdfBuffer = await makeRequest(url, 'POST', JSON.stringify(postData));
      fs.writeFileSync(options.output, pdfBuffer);
      console.log(`PDF saved to ${options.output}`);
    } catch (error) {
      console.error('Server request failed:', error.message);
      if (error.message.includes('400') || error.message.includes('500')) {
        console.error('The server may not support the products format yet.');
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
});

// POST command for JSON file
program
  .command('post')
  .description('Generate PDF using a POST request with JSON file')
  .option('-f, --file <file>', 'JSON file with configuration');

addCommonOptions(program.commands[3]);

program.commands[3].action(async (options) => {
  try {
    console.log('Generating PDF via POST request...');
    
    let postData;
    
    if (options.file) {
      // Read from JSON file
      const filePath = path.resolve(options.file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      try {
        postData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (parseError) {
        throw new Error(`Invalid JSON in file: ${parseError.message}`);
      }
    } else {
      throw new Error('Please provide a JSON file with --file option');
    }
    
    const url = `${options.url}/generate-pdf`;
    const pdfBuffer = await makeRequest(url, 'POST', JSON.stringify(postData));
    
    fs.writeFileSync(options.output, pdfBuffer);
    console.log(`PDF saved to ${options.output}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
});

program.parse(process.argv); 