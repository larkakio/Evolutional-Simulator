// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInScript is Script {
    function run() public {
        vm.startBroadcast();
        new CheckIn();
        vm.stopBroadcast();
    }
}
