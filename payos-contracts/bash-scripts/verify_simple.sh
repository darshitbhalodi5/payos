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
echo -e "${GREEN}║   Payos Split Contract Verification           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Contract configuration
CONTRACT_NAME="PayosSplit"
CONTRACT_FILE="src/PayosSplit.sol"

# ✅ Deployed contract addresses (deterministic deployment)
declare -A CONTRACT_ADDRESSES=(
    ["arb-sepolia"]="0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801"
    ["base-sepolia"]="0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801"
    ["op-sepolia"]="0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801"
    ["eth-sepolia"]="0x3bdeD6E96eeeB7858701A0291dBA9A84c8b9D801"
)

# Network configurations
declare -A NETWORKS=(
    ["arb-sepolia"]="421614"
    ["base-sepolia"]="84532"
    ["op-sepolia"]="11155420"
    ["eth-sepolia"]="11155111"
)

# Function to verify contract on a specific network
verify_contract() {
    local network=$1
    local chain_id=$2
    local contract_address=$3
    
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Verifying on: $network (Chain ID: $chain_id)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ "$contract_address" == "0x0000000000000000000000000000000000000000" ]; then
        echo -e "${RED}❌ Contract address not set for $network${NC}"
        echo -e "${YELLOW}Please update the CONTRACT_ADDRESSES array with the actual deployed address${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Contract Address: $contract_address${NC}"
    
    # Verify contract using Foundry
    echo -e "${YELLOW}Starting verification...${NC}"
    
    verification_output=$(forge verify-contract \
        --chain-id "$chain_id" \
        --num-of-optimizations 200 \
        --watch \
        --etherscan-api-key "$ETHERSCAN_API_KEY" \
        "$contract_address" \
        "$CONTRACT_NAME" \
        2>&1)
    
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully verified on $network${NC}"
        return 0
    else
        echo -e "${RED}❌ Verification failed for $network${NC}"
        echo "$verification_output" | tail -10
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    # Check if ETHERSCAN_API_KEY is set
    if [ -z "$ETHERSCAN_API_KEY" ]; then
        echo -e "${RED}❌ ETHERSCAN_API_KEY not set in .env file${NC}"
        echo -e "${YELLOW}Please add your Etherscan API key to the .env file${NC}"
        return 1
    fi
    
    # Check if forge is available
    if ! command -v forge &> /dev/null; then
        echo -e "${RED}❌ Forge not found. Please install Foundry${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
    return 0
}

# Main execution
main() {
    # Check prerequisites
    if ! check_prerequisites; then
        exit 1
    fi
    
    local success_count=0
    local total_count=0
    
    echo -e "\n${BLUE}Starting verification process...${NC}\n"
    
    # Verify all contracts
    for network in "${!CONTRACT_ADDRESSES[@]}"; do
        total_count=$((total_count + 1))
        
        if verify_contract "$network" "${NETWORKS[$network]}" "${CONTRACT_ADDRESSES[$network]}"; then
            success_count=$((success_count + 1))
        fi
        
        # Add delay between verifications to avoid rate limiting
        sleep 3
    done
    
    # Display summary
    echo -e "\n${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}          Verification Summary                   ${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}Successfully verified: $success_count/$total_count contracts${NC}"
    
    if [ $success_count -eq $total_count ]; then
        echo -e "${GREEN}🎉 All contracts verified successfully!${NC}"
        exit 0
    elif [ $success_count -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Partial success: $success_count out of $total_count contracts verified${NC}"
        exit 1
    else
        echo -e "${RED}❌ No contracts were verified successfully${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
