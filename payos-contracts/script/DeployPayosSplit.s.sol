// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console } from "forge-std/Script.sol";
import { PayosSplit } from "../src/PayosSplit.sol";

/**
 * @title DeployPayosSplit
 * @dev Simple deterministic deployment using CREATE2 directly
 */
contract DeployPayosSplit is Script {
    // Fixed salt for deterministic addresses across all chains
    bytes32 public constant SALT = keccak256("PAYOS_SPLIT_V1");

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("===========================================");
        console.log("Deploying PayosSplit Deterministically");
        console.log("===========================================");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Chain:", _getChainName(block.chainid));

        // Compute bytecode with constructor args
        bytes memory bytecode = abi.encodePacked(
            type(PayosSplit).creationCode,
            abi.encode(deployer)
        );

        // Use Foundry's built-in CREATE2 address computation
        address predictedAddress = vm.computeCreate2Address(
            SALT,
            keccak256(bytecode)
        );

        console.log("Predicted address:", predictedAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy using CREATE2
        PayosSplit payosSplit = new PayosSplit{salt: SALT}(deployer);
        address deployedAddress = address(payosSplit);

        vm.stopBroadcast();

        console.log("Deployed address:", deployedAddress);

        // Verify addresses match
        require(deployedAddress == predictedAddress, "Address mismatch!");

        console.log("===========================================");
        console.log("SUCCESS!");
        console.log("===========================================");
    }

    function _getChainName(
        uint256 chainId
    ) internal pure returns (string memory) {
        if (chainId == 11155420) return "op-sepolia";
        if (chainId == 84532) return "base-sepolia";
        if (chainId == 80002) return "polygon-amoy";
        if (chainId == 421614) return "arb-sepolia";
        if (chainId == 11155111) return "eth-sepolia";
        return vm.toString(chainId);
    }
}
