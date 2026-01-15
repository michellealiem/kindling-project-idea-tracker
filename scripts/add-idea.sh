#!/bin/bash
# Add a new idea to Kindling via API
# Usage: ./scripts/add-idea.sh "Title" "Description" [stage] [effort]
#
# Examples:
#   ./scripts/add-idea.sh "My Idea" "Description here"
#   ./scripts/add-idea.sh "My Idea" "Description" exploring medium

set -e

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep KINDLING_API_KEY | xargs)
fi

# Configuration - change this for production
API_URL="${KINDLING_API_URL:-http://localhost:3000}"

# Required arguments
TITLE="$1"
DESCRIPTION="$2"

# Optional arguments with defaults
STAGE="${3:-spark}"
EFFORT="${4:-medium}"

if [ -z "$TITLE" ]; then
  echo "Usage: $0 \"Title\" \"Description\" [stage] [effort]"
  echo ""
  echo "Stages: spark, exploring, building, waiting, simmering, shipped, paused"
  echo "Effort: trivial, small, medium, large, epic"
  exit 1
fi

# Build JSON payload
JSON=$(cat <<EOF
{
  "title": "$TITLE",
  "description": "$DESCRIPTION",
  "stage": "$STAGE",
  "effort": "$EFFORT"
}
EOF
)

# Make API request
if [ -n "$KINDLING_API_KEY" ]; then
  RESPONSE=$(curl -s -X POST "$API_URL/api/ideas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $KINDLING_API_KEY" \
    -d "$JSON")
else
  RESPONSE=$(curl -s -X POST "$API_URL/api/ideas" \
    -H "Content-Type: application/json" \
    -d "$JSON")
fi

# Check for errors
if echo "$RESPONSE" | grep -q '"error"'; then
  echo "Error: $RESPONSE"
  exit 1
fi

# Success
ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Created idea: $TITLE"
echo "ID: $ID"
echo "Stage: $STAGE"
