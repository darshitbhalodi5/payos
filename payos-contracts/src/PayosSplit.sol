// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayosSplit
 * @dev Smart contract for bill splitting with cross-chain support
 * @notice Handles split creation, contributions, auto-settlement
 * @author Payos Team
 */
contract PayosSplit is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ CUSTOM ERRORS ============
    error InvalidRecipient();
    error AmountTooSmall();
    error DescriptionRequired();
    error InvalidContributorCount();
    error ArrayLengthMismatch();
    error InvalidContributorAddress();
    error InvalidContributorAmount();
    error ContributorAmountMismatch();
    error SplitNotActive();
    error InvalidTargetAmount();
    error InvalidContributor();
    error NotAuthorizedContributor();
    error TargetNotReached();
    error ContributorNotFound();

    // ============ EVENTS ============
    event SplitCreated(
        bytes32 indexed splitId,
        address indexed creator,
        address recipient,
        uint256 targetChainId,
        address targetToken,
        uint256 targetAmount,
        bytes32 descriptionHash
    );

    event ContributionMade(
        bytes32 indexed splitId,
        address indexed contributor,
        uint256 sourceChainId,
        uint256 targetAmount,
        bytes32 indexed txHash
    );

    event SplitCompleted(
        bytes32 indexed splitId,
        address indexed recipient,
        uint256 totalAmount,
        uint32 timestamp
    );

    // ============ ENUMS ============
    enum Status {
        Active,
        Completed
    }

    // ============ STRUCTS ============

    struct SplitBill {
        bytes32 id;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 targetChainId;
        address creator;
        address recipient;
        address targetToken;
        uint32 createdAt;
        uint32 completedAt;
        Status status;
    }

    struct Contribution {
        bytes32 txHash;
        uint256 sourceChainId;
        uint256 sourceAmount;
        uint256 targetAmount;
        address contributor;
        uint32 timestamp;
    }

    struct ContributorInfo {
        uint256 targetAmount;
        uint256 contributedAmount;
        address contributor;
        uint32 lastContributionTime;
        bool hasContributed;
    }

    // ============ CONSTANTS & IMMUTABLES ============
    uint8 public constant MAX_CONTRIBUTORS = 10;
    uint256 private constant SPLIT_ID_COUNTER_START = 1000;

    // ============ STATE VARIABLES ============
    uint256 public splitIdCounter = SPLIT_ID_COUNTER_START;

    // ============ MAPPINGS ============
    mapping(bytes32 => SplitBill) public splits;
    mapping(bytes32 => Contribution[]) public contributions;
    mapping(bytes32 => ContributorInfo[]) public splitContributors;
    mapping(bytes32 => mapping(address => bool)) public isContributor;
    mapping(bytes32 => string) public splitDescriptions;

    // ============ CONSTRUCTOR ============
    constructor(address _owner) Ownable(_owner) {}

    // ============ EXTERNAL FUNCTIONS ============

    function createSplit(
        address _recipient,
        uint256 _targetChainId,
        address _targetToken,
        uint256 _targetAmount,
        string calldata _description,
        address[] calldata _contributors,
        uint256[] calldata _contributorAmounts
    ) external returns (bytes32) {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (bytes(_description).length == 0) revert DescriptionRequired();

        uint256 contributorsLength = _contributors.length;
        if (contributorsLength == 0 || contributorsLength > MAX_CONTRIBUTORS) {
            revert InvalidContributorCount();
        }
        if (contributorsLength != _contributorAmounts.length) {
            revert ArrayLengthMismatch();
        }

        uint256 totalContributorAmount;
        unchecked {
            for (uint256 i; i < contributorsLength; ++i) {
                address contributor = _contributors[i];
                uint256 amount = _contributorAmounts[i];
                
                if (contributor == address(0)) revert InvalidContributorAddress();
                if (amount == 0) revert InvalidContributorAmount();
                
                totalContributorAmount += amount;
            }
        }
        
        if (totalContributorAmount != _targetAmount) revert ContributorAmountMismatch();

        uint256 currentCounter = splitIdCounter;
        
        bytes32 splitId = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipient,
                _targetAmount,
                block.timestamp,
                currentCounter
            )
        );

        unchecked {
            splitIdCounter = currentCounter + 1;
        }

        uint32 currentTime = uint32(block.timestamp);

        splits[splitId] = SplitBill({
            id: splitId,
            creator: msg.sender,
            recipient: _recipient,
            targetChainId: _targetChainId,
            targetToken: _targetToken,
            targetAmount: _targetAmount,
            currentAmount: 0,
            status: Status.Active,
            createdAt: currentTime,
            completedAt: 0
        });

        splitDescriptions[splitId] = _description;

        unchecked {
            for (uint256 i; i < contributorsLength; ++i) {
                address contributor = _contributors[i];
                
                splitContributors[splitId].push(
                    ContributorInfo({
                        contributor: contributor,
                        targetAmount: _contributorAmounts[i],
                        contributedAmount: 0,
                        hasContributed: false,
                        lastContributionTime: 0
                    })
                );
                isContributor[splitId][contributor] = true;
            }
        }

        emit SplitCreated(
            splitId,
            msg.sender,
            _recipient,
            _targetChainId,
            _targetToken,
            _targetAmount,
            keccak256(bytes(_description))
        );

        return splitId;
    }

    function contributeToBill(
        bytes32 _splitId,
        address _contributor,
        uint256 _sourceChainId,
        uint256 _sourceAmount,
        uint256 _targetAmount,
        bytes32 _txHash
    ) external onlyOwner nonReentrant {
        SplitBill storage split = splits[_splitId];
        
        if (split.status != Status.Active) revert SplitNotActive();
        if (_targetAmount == 0) revert InvalidTargetAmount();
        if (_contributor == address(0)) revert InvalidContributor();
        if (!isContributor[_splitId][_contributor]) revert NotAuthorizedContributor();

        uint32 currentTime = uint32(block.timestamp);

        contributions[_splitId].push(
            Contribution({
                contributor: _contributor,
                sourceChainId: _sourceChainId,
                sourceAmount: _sourceAmount,
                targetAmount: _targetAmount,
                txHash: _txHash,
                timestamp: currentTime
            })
        );

        unchecked {
            split.currentAmount += _targetAmount;
        }

        ContributorInfo[] storage contributors = splitContributors[_splitId];
        uint256 contributorsLength = contributors.length;
        
        unchecked {
            for (uint256 i; i < contributorsLength; ++i) {
                if (contributors[i].contributor == _contributor) {
                    contributors[i].contributedAmount += _targetAmount;
                    contributors[i].hasContributed = true;
                    contributors[i].lastContributionTime = currentTime;
                    break;
                }
            }
        }

        emit ContributionMade(
            _splitId,
            _contributor,
            _sourceChainId,
            _targetAmount,
            _txHash
        );

        if (split.currentAmount >= split.targetAmount) {
            _completeSplit(_splitId);
        }
    }

    // ============ INTERNAL FUNCTIONS ============

    function _completeSplit(bytes32 _splitId) internal {
        SplitBill storage split = splits[_splitId];
        
        if (split.status != Status.Active) revert SplitNotActive();
        if (split.currentAmount < split.targetAmount) revert TargetNotReached();

        split.status = Status.Completed;
        split.completedAt = uint32(block.timestamp);

        address recipient = split.recipient;
        address token = split.targetToken;
        uint256 amount = split.currentAmount;

        IERC20(token).safeTransfer(recipient, amount);

        emit SplitCompleted(_splitId, recipient, amount, uint32(block.timestamp));
    }

    // ============ ADMIN FUNCTIONS ============

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }

    // ============ VIEW FUNCTIONS ============

    function getSplit(bytes32 _splitId) external view returns (SplitBill memory) {
        return splits[_splitId];
    }

    function getContributions(bytes32 _splitId) external view returns (Contribution[] memory) {
        return contributions[_splitId];
    }

    function getSplitContributors(bytes32 _splitId) external view returns (ContributorInfo[] memory) {
        return splitContributors[_splitId];
    }

    function getDescription(bytes32 _splitId) external view returns (string memory) {
        return splitDescriptions[_splitId];
    }

    function getContributorInfo(
        bytes32 _splitId,
        address _contributor
    ) external view returns (ContributorInfo memory) {
        ContributorInfo[] memory contributors = splitContributors[_splitId];
        uint256 length = contributors.length;
        
        unchecked {
            for (uint256 i; i < length; ++i) {
                if (contributors[i].contributor == _contributor) {
                    return contributors[i];
                }
            }
        }
        revert ContributorNotFound();
    }

    function isAuthorizedContributor(
        bytes32 _splitId,
        address _contributor
    ) external view returns (bool) {
        return isContributor[_splitId][_contributor];
    }

    function getSplitProgress(bytes32 _splitId) external view returns (uint256, uint256) {
        SplitBill memory split = splits[_splitId];
        return (split.currentAmount, split.targetAmount);
    }

    function getContributorAmount(
        bytes32 _splitId,
        address _contributor
    ) external view returns (uint256) {
        ContributorInfo[] memory contributors = splitContributors[_splitId];
        uint256 length = contributors.length;
        
        unchecked {
            for (uint256 i; i < length; ++i) {
                if (contributors[i].contributor == _contributor) {
                    return contributors[i].contributedAmount;
                }
            }
        }
        return 0;
    }

    function isSplitActive(bytes32 _splitId) external view returns (bool) {
        return splits[_splitId].status == Status.Active;
    }

    receive() external payable {}
}