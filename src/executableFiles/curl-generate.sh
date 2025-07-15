#!/bin/bash

echo "Grove PDF Generator (curl version)"
echo "================================="
echo

read -p "Domain [grove.xiber.net]: " DOMAIN
DOMAIN=${DOMAIN:-grove.xiber.net}

read -p "Included Speed [400/400]: " INC_SPEED
INC_SPEED=${INC_SPEED:-400/400}

read -p "Included Units [MBPS]: " INC_UNITS
INC_UNITS=${INC_UNITS:-MBPS}

echo
echo "Additional Speed 1:"
read -p "Speed [1/1]: " ADD_SPEED1
ADD_SPEED1=${ADD_SPEED1:-1/1}

read -p "Units [GBPS]: " ADD_UNITS1
ADD_UNITS1=${ADD_UNITS1:-GBPS}

read -p "Price [$25]: " ADD_PRICE1
ADD_PRICE1=${ADD_PRICE1:-25}

echo
echo "Additional Speed 2 (leave blank to skip):"
read -p "Speed: " ADD_SPEED2

if [ ! -z "$ADD_SPEED2" ]; then
  read -p "Units [GBPS]: " ADD_UNITS2
  ADD_UNITS2=${ADD_UNITS2:-GBPS}

  read -p "Price [$35]: " ADD_PRICE2
  ADD_PRICE2=${ADD_PRICE2:-35}
fi

echo
echo "Additional Speed 3 (leave blank to skip):"
read -p "Speed: " ADD_SPEED3

if [ ! -z "$ADD_SPEED3" ]; then
  read -p "Units [GBPS]: " ADD_UNITS3
  ADD_UNITS3=${ADD_UNITS3:-GBPS}

  read -p "Price [$45]: " ADD_PRICE3
  ADD_PRICE3=${ADD_PRICE3:-45}
fi

echo
echo "TV Addons (press Enter to skip all TV data):"
read -p "Skip TV data? [Y/n]: " TV_SKIP
TV_SKIP=${TV_SKIP:-Y}

if [[ "${TV_SKIP,,}" != "y" ]]; then
  echo "TV Addon 1:"
  read -p "Title [Premium Channels]: " TV_TITLE1
  TV_TITLE1=${TV_TITLE1:-"Premium Channels"}

  read -p "Subtitle [Showtime, STARZ, Encore, etc]: " TV_SUBTITLE1
  TV_SUBTITLE1=${TV_SUBTITLE1:-"Showtime, STARZ, Encore, etc"}

  read -p "Price [$15]: " TV_AMOUNT1
  TV_AMOUNT1=${TV_AMOUNT1:-15}

  echo
  echo "TV Addon 2 (leave blank to skip):"
  read -p "Title: " TV_TITLE2

  if [ ! -z "$TV_TITLE2" ]; then
    read -p "Subtitle: " TV_SUBTITLE2
    read -p "Price: " TV_AMOUNT2
  fi

  echo
  echo "TV Addon 3 (leave blank to skip):"
  read -p "Title: " TV_TITLE3

  if [ ! -z "$TV_TITLE3" ]; then
    read -p "Subtitle: " TV_SUBTITLE3
    read -p "Price: " TV_AMOUNT3
  fi
fi

echo
read -p "Output filename [grove-output.pdf]: " OUTPUT
OUTPUT=${OUTPUT:-grove-output.pdf}

# Set server URL to default value without prompting
SERVER_URL="https://grove-pdf-backend.onrender.com"

echo
echo "Generating PDF..."

# Create JSON data
JSON="{
  \"domain\": \"$DOMAIN\",
  \"includedSpeed\": \"$INC_SPEED\",
  \"includedUnits\": \"$INC_UNITS\",
  \"additionalSpeeds\": ["

FIRST_ITEM=true

# Add first speed if present
if [ ! -z "$ADD_SPEED1" ]; then
  JSON="$JSON{ \"speed\": \"$ADD_SPEED1\", \"units\": \"$ADD_UNITS1\", \"price\": \"$ADD_PRICE1\" }"
  FIRST_ITEM=false
fi

# Add second speed if present
if [ ! -z "$ADD_SPEED2" ]; then
  if [ "$FIRST_ITEM" = false ]; then
    JSON="$JSON,"
  fi
  JSON="$JSON{ \"speed\": \"$ADD_SPEED2\", \"units\": \"$ADD_UNITS2\", \"price\": \"$ADD_PRICE2\" }"
  FIRST_ITEM=false
fi

# Add third speed if present
if [ ! -z "$ADD_SPEED3" ]; then
  if [ "$FIRST_ITEM" = false ]; then
    JSON="$JSON,"
  fi
  JSON="$JSON{ \"speed\": \"$ADD_SPEED3\", \"units\": \"$ADD_UNITS3\", \"price\": \"$ADD_PRICE3\" }"
fi

JSON="$JSON],
  \"tv_addons\": ["

if [[ "${TV_SKIP,,}" != "y" ]]; then
  FIRST_ITEM=true

  # Add first TV addon if present
  if [ ! -z "$TV_TITLE1" ]; then
    JSON="$JSON{ \"title\": \"$TV_TITLE1\", \"subtitle\": \"$TV_SUBTITLE1\", \"amount\": \"$TV_AMOUNT1\" }"
    FIRST_ITEM=false
  fi

  # Add second TV addon if present
  if [ ! -z "$TV_TITLE2" ]; then
    if [ "$FIRST_ITEM" = false ]; then
      JSON="$JSON,"
    fi
    JSON="$JSON{ \"title\": \"$TV_TITLE2\", \"subtitle\": \"$TV_SUBTITLE2\", \"amount\": \"$TV_AMOUNT2\" }"
    FIRST_ITEM=false
  fi

  # Add third TV addon if present
  if [ ! -z "$TV_TITLE3" ]; then
    if [ "$FIRST_ITEM" = false ]; then
      JSON="$JSON,"
    fi
    JSON="$JSON{ \"title\": \"$TV_TITLE3\", \"subtitle\": \"$TV_SUBTITLE3\", \"amount\": \"$TV_AMOUNT3\" }"
  fi
fi

JSON="$JSON]
}"

echo "Sending request with data:"
echo "$JSON"
echo

# Use curl to send request
curl -X POST "$SERVER_URL/generate-pdf" \
  -H "Content-Type: application/json" \
  -d "$JSON" \
  --output "$OUTPUT"

echo
if [ $? -eq 0 ]; then
  echo "PDF generated successfully and saved to $OUTPUT"
else
  echo "Error generating PDF. Please check if the server is running."
fi

read -p "Press Enter to continue..." 