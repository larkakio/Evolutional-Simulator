// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn public checkIn;
    address public alice = address(0xA11CE);

    uint256 internal constant DAY = 86400;

    function setUp() public {
        checkIn = new CheckIn();
    }

    function test_CheckIn_FirstTime() public {
        vm.startPrank(alice);
        checkIn.checkIn();
        vm.stopPrank();

        uint256 today = block.timestamp / DAY;
        assertEq(checkIn.lastCheckDay(alice), today);
        assertEq(checkIn.streak(alice), 1);
    }

    function test_CheckIn_RevertSameDay() public {
        vm.startPrank(alice);
        checkIn.checkIn();
        vm.expectRevert(CheckIn.AlreadyCheckedIn.selector);
        checkIn.checkIn();
        vm.stopPrank();
    }

    function test_CheckIn_RevertWithValue() public {
        vm.deal(alice, 1 ether);
        vm.expectRevert(CheckIn.ValueNotZero.selector);
        vm.prank(alice);
        checkIn.checkIn{value: 1 wei}();
    }

    function test_CheckIn_NextDay_IncrementsStreak() public {
        vm.startPrank(alice);
        checkIn.checkIn();
        vm.warp(block.timestamp + DAY);
        checkIn.checkIn();
        vm.stopPrank();

        assertEq(checkIn.streak(alice), 2);
    }

    function test_CheckIn_SkipDay_ResetsStreak() public {
        vm.startPrank(alice);
        checkIn.checkIn();
        vm.warp(block.timestamp + 2 * DAY);
        checkIn.checkIn();
        vm.stopPrank();

        assertEq(checkIn.streak(alice), 1);
    }
}
