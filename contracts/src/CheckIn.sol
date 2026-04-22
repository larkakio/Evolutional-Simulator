// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Daily on-chain check-in on Base. User pays only gas; tips are rejected.
contract CheckIn {
    uint256 private constant SECONDS_PER_DAY = 86400;

    error AlreadyCheckedIn();
    error ValueNotZero();

    /// @dev Stores (lastCalendarDay + 1); 0 means the address has never checked in.
    mapping(address => uint256) public lastCheckDayPlusOne;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 dayIndex, uint256 newStreak);

    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotZero();

        uint256 day = block.timestamp / SECONDS_PER_DAY;
        uint256 raw = lastCheckDayPlusOne[msg.sender];

        if (raw != 0) {
            uint256 lastDay = raw - 1;
            if (lastDay == day) revert AlreadyCheckedIn();
        }

        uint256 newStreak;
        if (raw == 0) {
            newStreak = 1;
        } else {
            uint256 lastDay = raw - 1;
            if (day == lastDay + 1) {
                newStreak = streak[msg.sender] + 1;
            } else {
                newStreak = 1;
            }
        }

        lastCheckDayPlusOne[msg.sender] = day + 1;
        streak[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, day, newStreak);
    }

    /// @notice Last UTC calendar day index when `user` checked in (same units as `block.timestamp / 86400`).
    function lastCheckDay(address user) external view returns (uint256) {
        uint256 raw = lastCheckDayPlusOne[user];
        return raw == 0 ? 0 : raw - 1;
    }
}
