// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface ILOCKER {
    struct Lock {
        /// @notice The unique identifier of the iLock
        uint256 lockId;
        /// @notice The token which was locked
        IERC20 token;
        /// @notice The creator of the iLock which might no longer own the iLock shard
        address payable creator;
        /// @notice The holder of the iLock which owns the iLock shard
        address payable holder;
        /// @notice The amount of tokens initially locked
        uint256 amount;
        /// @notice Whether this Lock was claimed
        bool claimed;
        /// @notice Whether this Lock contains ETH
        bool Ether;
        /// @notice The unix timestamp in seconds after which withdrawing the tokens is allowed
        uint256 unlockTimestamp;
        /// @notice The address of the holding contract
        address payable holdingContract;
        /// @notice Indicates that the Locker governance (operator) can disable the timelock (unlockTimestamp) on this iLock.
        /// @notice This could be useful in case the iLock owner is scared about deployment issues for example.
        bool unlockableByGovernance;
        /// @notice Indicates whether the Locker governance (operator) has unlocked this iLock for early withdrawal by the iLock owner.
        /// @notice Can only be set to true by Locker governance (operator) if unlockableByGovernance is set to true.
        bool unlockedByGovernance;
        bool lockedByGovernance;
    }
    struct i_Locks_ {
        Lock[] _my_iLocks;
    }

    function isValidLock(uint256 lockId) external view returns (bool);

    function createLock(
        IERC20 token,
        bool isEth,
        address holder,
        uint256 amount,
        uint256 unlockTimestamp
    )
        external
        payable
        returns (
            uint256,
            address
        );

    function withdraw(
        uint256 lockId,
        address payable recipient,
        bool isEth
    ) external payable;
}
