#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
source .env

echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Payos Split Deterministic Deployment        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Array of networks
declare -A NETWORKS=(
    ["arb-sepolia"]="$ARB_SEPOLIA_RPC_URL"
    ["polygon-amoy"]="$POLYGON_AMOY_RPC_URL"
    ["base-sepolia"]="$BASE_SEPOLIA_RPC_URL"
    ["op-sepolia"]="$OP_SEPOLIA_RPC_URL"
    ["eth-sepolia"]="$ETH_SEPOLIA_RPC_URL"
)

# Store deployed addresses
declare -A DEPLOYED_ADDRESSES

# Function to deploy to a network
deploy_to_network() {
    local network=$1
    local rpc_url=$2
    
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Deploying to: $network${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ -z "$rpc_url" ] || [ "$rpc_url" == "infura_or_alchemy_rpc" ]; then
        echo -e "${RED}RPC URL not configured for $network, skipping...${NC}"
        return
    fi
    
    # Deploy using SimpleDeployPayosSplit
    output=$(forge script script/DeployPayosSplit.s.sol:DeployPayosSplit \
        --rpc-url "$rpc_url" \
        --broadcast \
        --legacy \
        2>&1)
    
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}Successfully deployed to $network${NC}"
        
        # Extract deployed address from output
        address=$(echo "$output" | grep "Deployed address:" | tail -1 | awk '{print $3}')
        
        if [ -n "$address" ]; then
            DEPLOYED_ADDRESSES[$network]=$address
            echo -e "${BLUE}Contract Address: $address${NC}"
        fi
    else
        echo -e "${RED}Deployment failed for $network${NC}"
        echo "$output" | tail -10
    fi
    
    sleep 2
}

# Main deployment loop
echo -e "${BLUE}Starting deployments...${NC}\n"

for network in arb-sepolia polygon-amoy base-sepolia op-sepolia eth-sepolia; do
    deploy_to_network "$network" "${NETWORKS[$network]}"
done

# Summary
echo -e "\n${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}          Deployment Summary                    ${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}\n"

# Display all deployed addresses
all_same=true
first_address=""

for network in arb-sepolia polygon-amoy base-sepolia op-sepolia eth-sepolia; do
    address="${DEPLOYED_ADDRESSES[$network]}"
    if [ -n "$address" ]; then
        echo -e "${GREEN}$network:${NC} $address"
        
        if [ -z "$first_address" ]; then
            first_address="$address"
        elif [ "$address" != "$first_address" ]; then
            all_same=false
        fi
    fi
done

echo ""
if [ "$all_same" = true ] && [ -n "$first_address" ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║    SUCCESS! Same address on ALL chains!       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
    echo -e "${BLUE}Contract Address: $first_address${NC}"
else
    echo -e "${YELLOW}WARNING: Different addresses detected!${NC}"
fi

echo -e "\n${GREEN}Done!${NC}\n"