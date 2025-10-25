// Comprehensive ABI for PayosSplit contract
// This includes all functions needed for frontend integration

export const PAYOS_SPLIT_ABI = [
  // ============ WRITE FUNCTIONS ============
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_targetChainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_targetToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_targetAmount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "_contributors",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_contributorAmounts",
        "type": "uint256[]"
      }
    ],
    "name": "createSplit",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_contributor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_sourceChainId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_sourceAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_targetAmount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "_txHash",
        "type": "bytes32"
      }
    ],
    "name": "contributeToBill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ============ VIEW FUNCTIONS ============
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "getSplit",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "targetAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "targetChainId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "targetToken",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "createdAt",
            "type": "uint32"
          },
          {
            "internalType": "uint32",
            "name": "completedAt",
            "type": "uint32"
          },
          {
            "internalType": "enum PayosSplit.Status",
            "name": "status",
            "type": "uint8"
          }
        ],
        "internalType": "struct PayosSplit.SplitBill",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "getContributions",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "txHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "sourceChainId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "sourceAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "targetAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "contributor",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "timestamp",
            "type": "uint32"
          }
        ],
        "internalType": "struct PayosSplit.Contribution[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "getSplitContributors",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "targetAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "contributedAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "contributor",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "lastContributionTime",
            "type": "uint32"
          },
          {
            "internalType": "bool",
            "name": "hasContributed",
            "type": "bool"
          }
        ],
        "internalType": "struct PayosSplit.ContributorInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "getDescription",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_contributor",
        "type": "address"
      }
    ],
    "name": "getContributorInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "targetAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "contributedAmount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "contributor",
            "type": "address"
          },
          {
            "internalType": "uint32",
            "name": "lastContributionTime",
            "type": "uint32"
          },
          {
            "internalType": "bool",
            "name": "hasContributed",
            "type": "bool"
          }
        ],
        "internalType": "struct PayosSplit.ContributorInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_contributor",
        "type": "address"
      }
    ],
    "name": "isAuthorizedContributor",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "getSplitProgress",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_contributor",
        "type": "address"
      }
    ],
    "name": "getContributorAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "isSplitActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ============ FRONTEND INTEGRATION FUNCTIONS ============
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_creator",
        "type": "address"
      }
    ],
    "name": "getSplitsByCreator",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_recipient",
        "type": "address"
      }
    ],
    "name": "getSplitsByRecipient",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_contributor",
        "type": "address"
      }
    ],
    "name": "getSplitsByContributor",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_offset",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      }
    ],
    "name": "getAllSplits",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSplitCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "getSplitStatus",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_splitId",
        "type": "bytes32"
      }
    ],
    "name": "getSplitDetails",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "targetChainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "targetToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "targetAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentAmount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      },
      {
        "internalType": "uint32",
        "name": "createdAt",
        "type": "uint32"
      },
      {
        "internalType": "uint32",
        "name": "completedAt",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ============ CONSTANTS ============
  {
    "inputs": [],
    "name": "MAX_CONTRIBUTORS",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "splitIdCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ============ EVENTS ============
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "splitId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "targetChainId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "targetToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "targetAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "descriptionHash",
        "type": "bytes32"
      }
    ],
    "name": "SplitCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "splitId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contributor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sourceChainId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "targetAmount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "txHash",
        "type": "bytes32"
      }
    ],
    "name": "ContributionMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "splitId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint32",
        "name": "timestamp",
        "type": "uint32"
      }
    ],
    "name": "SplitCompleted",
    "type": "event"
  },
  // ============ RECEIVE FUNCTION ============
  {
    "stateMutability": "payable",
    "type": "receive"
  }
] as const;
