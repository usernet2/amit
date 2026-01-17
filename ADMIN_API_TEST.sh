#!/bin/bash

# Admin API Testing Script
# Use this to test all admin endpoints

BASE_URL="http://localhost:5000/api"
ADMIN_TOKEN="your_admin_jwt_token_here"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Admin API Testing ===${NC}\n"

# 1. Test Formations

echo -e "${YELLOW}Testing Formations${NC}"

echo -e "${GREEN}GET /admin/formations${NC}"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/admin/formations" | jq '.'

echo -e "\n${GREEN}POST /admin/formations${NC}"
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "Formation React",
    "description": "Apprentissage de React JS"
  }' \
  "$BASE_URL/admin/formations" | jq '.'

# 2. Test Visites

echo -e "\n${YELLOW}Testing Visites${NC}"

echo -e "${GREEN}GET /admin/visites${NC}"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/admin/visites" | jq '.'

echo -e "\n${GREEN}POST /admin/visites/entreprise${NC}"
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "adherant_id": 1,
    "date_heure": "2024-02-15T14:00:00"
  }' \
  "$BASE_URL/admin/visites/entreprise" | jq '.'

echo -e "\n${GREEN}POST /admin/visites/systematique${NC}"
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "adherant_id": 1,
    "date_deb": "2024-02-01",
    "date_fin": "2024-02-28"
  }' \
  "$BASE_URL/admin/visites/systematique" | jq '.'

# 3. Test Sensibilisations

echo -e "\n${YELLOW}Testing Sensibilisations${NC}"

echo -e "${GREEN}GET /admin/sensibilisations${NC}"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/admin/sensibilisations" | jq '.'

echo -e "\n${GREEN}POST /admin/sensibilisations${NC}"
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sujet": "Sécurité Informatique",
    "date": "2024-02-20",
    "adherant_id": 1
  }' \
  "$BASE_URL/admin/sensibilisations" | jq '.'

# 4. Test Participations

echo -e "\n${YELLOW}Testing Participations${NC}"

echo -e "${GREEN}GET /admin/participations${NC}"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/admin/participations" | jq '.'

echo -e "\n${GREEN}POST /admin/participations${NC}"
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "formation_id": 1,
    "adherant_id": 1,
    "date_deb": "2024-02-01",
    "date_fin": "2024-02-28"
  }' \
  "$BASE_URL/admin/participations" | jq '.'

# 5. Test Cancelled Activities

echo -e "\n${YELLOW}Testing Cancelled Activities${NC}"

echo -e "${GREEN}GET /admin/cancelled${NC}"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$BASE_URL/admin/cancelled" | jq '.'

echo -e "\n${GREEN}POST /admin/replan/:type/:id${NC}"
echo "Example: Replan visite_entreprise with ID 1"
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date_heure": "2024-03-01T14:00:00"
  }' \
  "$BASE_URL/admin/replan/visite_entreprise/1" | jq '.'

echo -e "\n${YELLOW}=== Testing Complete ===${NC}\n"
