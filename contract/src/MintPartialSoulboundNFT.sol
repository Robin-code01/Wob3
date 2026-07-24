// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseModuleSoulbound is ERC721, Ownable {
    struct Completion {
        string courseName;
        string moduleName;
        bool isCertificate;
    }

    uint256 private _nextTokenId;

    // Course registration
    mapping(bytes32 => string) public courseNames;
    mapping(bytes32 => string[]) private courseModules;
    mapping(bytes32 => mapping(bytes32 => bool)) public courseModuleRequired;

    // Student progress state
    mapping(address => mapping(bytes32 => mapping(bytes32 => bool))) public moduleCompleted;
    mapping(address => mapping(bytes32 => bool)) public certificateClaimed;

    // Token metadata
    mapping(uint256 => Completion) public tokenData;

    event CourseRegistered(bytes32 indexed courseId, string courseName);
    event ModuleCompleted(
        address indexed student,
        bytes32 indexed courseId,
        bytes32 indexed moduleId,
        uint256 tokenId,
        string courseName,
        string moduleName
    );
    event CourseCertificateIssued(
        address indexed student,
        bytes32 indexed courseId,
        uint256 tokenId,
        string courseName
    );

    constructor() ERC721("CourseM// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseModuleSoulbound is ERC721, Ownable {
    struct Completion {
        string courseName;
        string moduleName;
        bool isCertificate;
    }

    uint256 private _nextTokenId;

    // Course registration
    mapping(bytes32 => string) public courseNames;
    mapping(bytes32 => string[]) private courseModules;
    mapping(bytes32 => mapping(bytes32 => bool)) public courseModuleRequired;

    // Student progress state
    mapping(address => mapping(bytes32 => mapping(bytes32 => bool))) public moduleCompleted;
    mapping(address => mapping(bytes32 => bool)) public certificateClaimed;

    // Token metadata
    mapping(uint256 => Completion) public tokenData;

    event CourseRegistered(bytes32 indexed courseId, string courseName);
    event ModuleCompleted(
        address indexed student,
        bytes32 indexed courseId,
        bytes32 indexed moduleId,
        uint256 tokenId,
        string courseName,
        string moduleName
    );
    event CourseCertificateIssued(
        address indexed student,
        bytes32 indexed courseId,
        uint256 tokenId,
        string courseName
    );

    constructor() ERC721("CourseModuleSoulbound", "CMSB") {}

    function registerCourse(string calldata courseName, string[] calldata moduleNames) external onlyOwner {
        bytes32 courseId = _courseId(courseName);
        require(bytes(courseNames[courseId]).length == 0, "Course already registered");
        require(moduleNames.length > 0, "Course must have modules");

        courseNames[courseId] = courseName;

        for (uint256 i = 0; i < moduleNames.length; i++) {
            bytes32 moduleId = _moduleId(moduleNames[i]);
            require(!courseModuleRequired[courseId][moduleId], "Duplicate module name");
            courseModuleRequired[courseId][moduleId] = true;
            courseModules[courseId].push(moduleNames[i]);
        }

        emit CourseRegistered(courseId, courseName);
    }

    function mintModuleCompletion(
        address student,
        string calldata courseName,
        string calldata moduleName
    ) external onlyOwner {
        bytes32 courseId = _courseId(courseName);
        bytes32 moduleId = _moduleId(moduleName);

        require(bytes(courseNames[courseId]).length != 0, "Course not registered");
        require(courseModuleRequired[courseId][moduleId], "Module not part of course");
        require(!moduleCompleted[student][courseId][moduleId], "Module already completed");

        moduleCompleted[student][courseId][moduleId] = true;
        _nextTokenId += 1;
        tokenData[_nextTokenId] = Completion(courseName, moduleName, false);
        _safeMint(student, _nextTokenId);

        emit ModuleCompleted(student, courseId, moduleId, _nextTokenId, courseName, moduleName);
    }

    function claimCourseCertificate(string calldata courseName) external {
        bytes32 courseId = _courseId(courseName);
        require(bytes(courseNames[courseId]).length != 0, "Course not registered");
        require(!certificateClaimed[msg.sender][courseId], "Certificate already claimed");
        require(_hasAllModules(msg.sender, courseId), "Missing one or more module completions");

        certificateClaimed[msg.sender][courseId] = true;
        _nextTokenId += 1;
        tokenData[_nextTokenId] = Completion(courseName, "CERTIFICATE", true);
        _safeMint(msg.sender, _nextTokenId);

        emit CourseCertificateIssued(msg.sender, courseId, _nextTokenId, courseName);
    }

    function getCourseModules(string calldata courseName) external view returns (string[] memory) {
        bytes32 courseId = _courseId(courseName);
        return courseModules[courseId];
    }

    function _hasAllModules(address student, bytes32 courseId) internal view returns (bool) {
        string[] storage modules = courseModules[courseId];
        for (uint256 i = 0; i < modules.length; i++) {
            if (!moduleCompleted[student][courseId][_moduleId(modules[i])]) {
                return false;
            }
        }
        return true;
    }

    function _courseId(string memory courseName) internal pure returns (bytes32) {
        return keccak256(bytes(courseName));
    }

    function _moduleId(string memory moduleName) internal pure returns (bytes32) {
        return keccak256(bytes(moduleName));
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(from == address(0) || to == address(0), "Soulbound: transfers disabled");
    }

    function approve(address, uint256) public pure override {
        revert("Soulbound: approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: approvals disabled");
    }
}oduleSoulbound", "CMSB") {}

    function registerCourse(string calldata courseName, string[] calldata moduleNames) external onlyOwner {
        bytes32 courseId = _courseId(courseName);
        require(bytes(courseNames[courseId]).length == 0, "Course already registered");
        require(moduleNames.length > 0, "Course must have modules");

        courseNames[courseId] = courseName;

        for (uint256 i = 0; i < moduleNames.length; i++) {
            bytes32 moduleId = _moduleId(moduleNames[i]);
            require(!courseModuleRequired[courseId][moduleId], "Duplicate module name");
            courseModuleRequired[courseId][moduleId] = true;
            courseModules[courseId].push(moduleNames[i]);
        }

        emit CourseRegistered(courseId, courseName);
    }

    function mintModuleCompletion(
        address student,
        string calldata courseName,
        string calldata moduleName
    ) external onlyOwner {
        bytes32 courseId = _courseId(courseName);
        bytes32 moduleId = _moduleId(moduleName);

        require(bytes(courseNames[courseId]).length != 0, "Course not registered");
        require(courseModuleRequired[courseId][moduleId], "Module not part of course");
        require(!moduleCompleted[student][courseId][moduleId], "Module already completed");

        moduleCompleted[student][courseId][moduleId] = true;
        _nextTokenId += 1;
        tokenData[_nextTokenId] = Completion(courseName, moduleName, false);
        _safeMint(student, _nextTokenId);

        emit ModuleCompleted(student, courseId, moduleId, _nextTokenId, courseName, moduleName);
    }

    function claimCourseCertificate(string calldata courseName) external {
        bytes32 courseId = _courseId(courseName);
        require(bytes(courseNames[courseId]).length != 0, "Course not registered");
        require(!certificateClaimed[msg.sender][courseId], "Certificate already claimed");
        require(_hasAllModules(msg.sender, courseId), "Missing one or more module completions");

        certificateClaimed[msg.sender][courseId] = true;
        _nextTokenId += 1;
        tokenData[_nextTokenId] = Completion(courseName, "CERTIFICATE", true);
        _safeMint(msg.sender, _nextTokenId);

        emit CourseCertificateIssued(msg.sender, courseId, _nextTokenId, courseName);
    }

    function getCourseModules(string calldata courseName) external view returns (string[] memory) {
        bytes32 courseId = _courseId(courseName);
        return courseModules[courseId];
    }

    function _hasAllModules(address student, bytes32 courseId) internal view returns (bool) {
        string[] storage modules = courseModules[courseId];
        for (uint256 i = 0; i < modules.length; i++) {
            if (!moduleCompleted[student][courseId][_moduleId(modules[i])]) {
                return false;
            }
        }
        return true;
    }

    function _courseId(string memory courseName) internal pure returns (bytes32) {
        return keccak256(bytes(courseName));
    }

    function _moduleId(string memory moduleName) internal pure returns (bytes32) {
        return keccak256(bytes(moduleName));
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(from == address(0) || to == address(0), "Soulbound: transfers disabled");
    }

    function approve(address, uint256) public pure override {
        revert("Soulbound: approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: approvals disabled");
    }
}