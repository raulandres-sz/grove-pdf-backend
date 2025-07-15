# Grove PDF Editor

A tool for automatically generating custom Grove PDF files with configurable speeds, prices, domain information, and TV options.

## Features

- Express.js backend to handle PDF processing
- Supports GET requests with query parameters
- Supports POST requests with JSON data
- Simple CLI tool for easy command-line usage
- Supports up to 3 additional speed/unit/price configurations
- Supports up to 3 TV addon packages
- Automatic fallback to cheetah image when no TV data is provided
- Supports multiple JSON data formats

## Usage

### Server API

#### GET /generate-pdf

Generate a PDF using query parameters (legacy format):

```
GET /generate-pdf?domain=example.com&includedSpeed=400/400&includedUnits=MBPS&speed1=1/1&units1=GBPS&price1=25&tvTitle1=Premium Channels&tvSubtitle1=Showtime, STARZ, Encore&tvAmount1=15
```

Query Parameters:
- `domain`: Domain name
- `includedSpeed`: Base speed (e.g., "400/400")
- `includedUnits`: Base speed units (e.g., "MBPS")
- For each additional speed (1-3):
  - `speedN`: Speed value
  - `unitsN`: Speed units
  - `priceN`: Price
- For each TV addon (1-3):
  - `tvTitleN`: Package title
  - `tvSubtitleN`: Package description
  - `tvAmountN`: Monthly price

#### POST /generate-pdf

Generate a PDF using a JSON request body. Multiple data formats are supported:

**Legacy Format:**
```json
{
  "domain": "example.com",
  "includedSpeed": "400/400",
  "includedUnits": "MBPS",
  "additionalSpeeds": [
    {
      "speed": "1/1",
      "units": "GBPS",
      "price": "25"
    },
    {
      "speed": "2/2",
      "units": "GBPS",
      "price": "35"
    }
  ],
  "tv_addons": [
    {
      "title": "Premium Channels",
      "subtitle": "Showtime, STARZ, Encore, etc",
      "amount": "15"
    },
    {
      "title": "Sports Package",
      "subtitle": "ESPN+, NFL Network, MLB.TV",
      "amount": "20"
    }
  ]
}
```

**New Format:**
```json
{
  "domain": "grove.xiber.net",
  "speeds": [
    {"speed": "400", "units": "Mbps", "included": true},
    {"speed": "500", "units": "Mbps", "price": 15},
    {"speed": "1", "units": "Gbps", "price": 25}
  ],
  "tv": [
    {"title": "XiberTV Gold", "subtitle": "130+ Channels", "amount": "39.99"},
    {"title": "XiberTV Platinum", "subtitle": "150+ Channels", "amount": "45.99"}
  ],
  "tv_addons": [
    {"title": "Premium Channels", "subtitle": "Showtime, STARZ, Encore, etc", "amount": "15"}
  ]
}
```

**Products Format:**
```json
{
  "products": {
    "internet": [
      {
        "included": true,
        "speed": "250/250",
        "units": "Mbps",
        "title": "250/250 Mbps",
        "subtitle": "Synchronous Speeds (Upload & Download)"
      },
      {
        "serviceID": "215",
        "amount": 15,
        "title": "500 Mbps Internet",
        "speed": "500",
        "units": "Mbps",
        "sync": true,
        "subtitle": "Synchronous Speeds (Upload & Download)"
      },
      {
        "serviceID": "219",
        "amount": 25,
        "title": "1 Gbps Internet Upgrade",
        "speed": "1",
        "units": "Gbps",
        "sync": true,
        "subtitle": "Synchronous Speeds (Upload & Download)"
      }
    ],
    "tv": [
      {
        "serviceID": 194674,
        "title": "Xiber TV Gold (120+ channels)",
        "subtitle": "150+ Channels",
        "link_learnmore": "https://xiber.com/xibertv/channels/#tab-3:",
        "amount": "62.99"
      },
      {
        "serviceID": 194675,
        "title": "Xiber TV Platinum (150+ channels)",
        "subtitle": "150+ Channels",
        "link_learnmore": "https://xiber.com/xibertv/channels/#tab-3:",
        "amount": "74.99"
      }
    ],
    "tv_addons": []
  },
  "domain": "747living.xiber.net"
}
```

### CLI Tool

#### Using Legacy Format (GET Request)

```bash
# Basic usage with internet and TV options
grove-pdf get -o output.pdf \
  --domain example.com \
  --included-speed 400/400 --included-units MBPS \
  --speed1 1/1 --units1 GBPS --price1 25 \
  --tvTitle1 "Premium Channels" --tvSubtitle1 "Showtime, STARZ, Encore" --tvAmount1 15
```

#### Using New Format

```bash
# Create PDF with new data format
grove-pdf create -o output.pdf \
  --domain grove.xiber.net \
  --incSpeed 400 --incUnits Mbps \
  --addSpeed1 500 --addUnits1 Mbps --addPrice1 15 \
  --addSpeed2 1 --addUnits2 Gbps --addPrice2 25 \
  --tvTitle1 "XiberTV Gold" --tvSubtitle1 "130+ Channels" --tvAmount1 39.99 \
  --tvTitle2 "XiberTV Platinum" --tvSubtitle2 "150+ Channels" --tvAmount2 45.99 \
  --addonTitle "Premium Channels" --addonSubtitle "Showtime, STARZ, Encore, etc" --addonAmount 15
```

#### Using Products Format

```bash
# Create PDF with products data format
grove-pdf products -o output.pdf \
  --domain 747living.xiber.net \
  --incSpeed "250/250" --incUnits Mbps \
  --incTitle "250/250 Mbps" --incSubtitle "Synchronous Speeds (Upload & Download)" \
  --addSpeed1 500 --addUnits1 Mbps --addPrice1 15 \
  --addTitle1 "500 Mbps Internet" --addServiceID1 215 \
  --addSpeed2 1 --addUnits2 Gbps --addPrice2 25 \
  --addTitle2 "1 Gbps Internet Upgrade" --addServiceID2 219 \
  --tvTitle1 "Xiber TV Gold (120+ channels)" --tvSubtitle1 "150+ Channels" --tvAmount1 62.99 \
  --tvService1 194674 \
  --tvTitle2 "Xiber TV Platinum (150+ channels)" --tvSubtitle2 "150+ Channels" --tvAmount2 74.99 \
  --tvService2 194675
```

#### Using JSON File (All Formats Supported)

```bash
# Using a JSON configuration file
grove-pdf post -f config.json -o output.pdf
```

Example JSON configuration (`config.json`) in products format:

```json
{
  "products": {
    "internet": [
      {
        "included": true,
        "speed": "250/250",
        "units": "Mbps",
        "title": "250/250 Mbps",
        "subtitle": "Synchronous Speeds (Upload & Download)"
      },
      {
        "serviceID": "215",
        "amount": 15,
        "title": "500 Mbps Internet",
        "speed": "500",
        "units": "Mbps",
        "sync": true,
        "subtitle": "Synchronous Speeds (Upload & Download)"
      },
      {
        "serviceID": "219",
        "amount": 25,
        "title": "1 Gbps Internet Upgrade",
        "speed": "1",
        "units": "Gbps",
        "sync": true,
        "subtitle": "Synchronous Speeds (Upload & Download)"
      }
    ],
    "tv": [
      {
        "serviceID": 194674,
        "title": "Xiber TV Gold (120+ channels)",
        "subtitle": "150+ Channels",
        "link_learnmore": "https://xiber.com/xibertv/channels/#tab-3:",
        "amount": "62.99"
      },
      {
        "serviceID": 194675,
        "title": "Xiber TV Platinum (150+ channels)",
        "subtitle": "150+ Channels",
        "link_learnmore": "https://xiber.com/xibertv/channels/#tab-3:",
        "amount": "74.99"
      }
    ],
    "tv_addons": []
  },
  "domain": "747living.xiber.net"
}
```

Note: If no TV addons are specified in any request type, the PDF will automatically display the cheetah image in the TV section.

## Error Handling

The application includes improved error handling for all data formats:

- Validation of required fields with appropriate fallbacks
- Detailed error messages for invalid JSON or missing data
- Graceful handling of malformed input with default values
- Size limits on file uploads

## Deployment

This application can be deployed to services like Render.com.

### Deploying to Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variable: `PORT=10000` (or any port)