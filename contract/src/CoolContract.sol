// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicCourseForge is ERC1155, Ownable {
    
    // Dictionary mapping a Certificate ID to an array of required Module IDs
    mapping(uint256 => uint256[]) public certificateRequirements;

    // NEW: Tracks if a wallet has already claimed a specific certificate 
    // to prevent infinite minting since tokens are no longer burned.
    mapping(address => mapping(uint256 => bool)) public hasClaimedCertificate;

    constructor() ERC1155("Wob3") Ownable(msg.sender) {}

    /**
     * @dev Django calls this when a creator publishes a new course.
     */
    function defineCourse(uint256 certificateId, uint256[] memory requiredModules) public onlyOwner {
        require(requiredModules.length > 0, "Course must have modules");
        certificateRequirements[certificateId] = requiredModules;
    }

    /**
     * @dev Django calls this when a student passes a specific module.
     */
    function mintModule(address student, uint256 moduleId) public onlyOwner {
        _mint(student, moduleId, 1, "");
    }

    /**
     * @dev The dynamic forge. Students keep their module tokens (Hold Mechanic).
     */
    function forgeCertificate(uint256 certificateId) public {
        // 1. Security Check: Ensure they haven't already minted this certificate
        require(!hasClaimedCertificate[msg.sender][certificateId], "Certificate already claimed");

        // 2. Look up the requirements for this specific certificate
        uint256[] memory requirements = certificateRequirements[certificateId];
        require(requirements.length > 0, "This certificate does not exist");

        // 3. Loop through every required module to verify ownership
        for (uint256 i = 0; i < requirements.length; i++) {
            uint256 moduleId = requirements[i];
            
            // Check if the student has it (no burning occurs)
            require(balanceOf(msg.sender, moduleId) >= 1, "Missing a required module token");
        }

        // 4. State Update: Mark as claimed BEFORE minting to prevent reentrancy attacks
        hasClaimedCertificate[msg.sender][certificateId] = true;

        // 5. Mint the final certificate
        _mint(msg.sender, certificateId, 1, "");
    }
}