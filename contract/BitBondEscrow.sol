// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BitBondEscrow
 * @author BitBond Protocol
 * @notice Bitcoin-native escrow for freelancers and clients, deployed on Midl infrastructure.
 *         Funds are locked on-chain and released only when the client approves delivery.
 *         No middleman. No custody risk. No ambiguity.
 */
contract BitBondEscrow {
    // ─────────────────────────────────────────────────────────────────────────
    //  Types
    // ─────────────────────────────────────────────────────────────────────────

    enum Status { PENDING, ACTIVE, RELEASED, DISPUTED, REFUNDED }

    struct Escrow {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;          // in wei (BTC-pegged on Midl)
        string  description;
        uint256 deadline;
        Status  status;
        uint256 createdAt;
        string  txHash;          // BTC TX that funded the escrow
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  State
    // ─────────────────────────────────────────────────────────────────────────

    uint256 public escrowCounter;

    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public freelancerEscrows;

    // ─────────────────────────────────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────────────────────────────────

    event EscrowCreated(
        uint256 indexed id,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        uint256 deadline,
        string  description
    );

    event FundsReleased(
        uint256 indexed id,
        address indexed freelancer,
        uint256 amount
    );

    event DisputeRaised(uint256 indexed id, address indexed raisedBy);
    event EscrowRefunded(uint256 indexed id, address indexed client, uint256 amount);

    // ─────────────────────────────────────────────────────────────────────────
    //  Errors
    // ─────────────────────────────────────────────────────────────────────────

    error OnlyClient();
    error OnlyFreelancer();
    error InvalidAmount();
    error InvalidAddress();
    error DeadlineMustBeFuture();
    error EscrowNotActive();
    error DeadlineNotPassed();
    error AlreadyReleased();
    error ReentrantCall();

    // ─────────────────────────────────────────────────────────────────────────
    //  Reentrancy guard
    // ─────────────────────────────────────────────────────────────────────────

    bool private _entered;

    modifier nonReentrant() {
        if (_entered) revert ReentrantCall();
        _entered = true;
        _;
        _entered = false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Core functions
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Create a new escrow agreement and lock funds on-chain.
     * @param freelancer  Address of the freelancer who will receive funds on approval.
     * @param description Human-readable description of the agreed work.
     * @param deadline    Unix timestamp by which the work must be delivered.
     */
    function createEscrow(
        address freelancer,
        string calldata description,
        uint256 deadline
    ) external payable nonReentrant returns (uint256) {
        if (msg.value == 0)              revert InvalidAmount();
        if (freelancer == address(0))    revert InvalidAddress();
        if (freelancer == msg.sender)    revert InvalidAddress();
        if (deadline <= block.timestamp) revert DeadlineMustBeFuture();

        uint256 id = ++escrowCounter;

        escrows[id] = Escrow({
            id:          id,
            client:      msg.sender,
            freelancer:  freelancer,
            amount:      msg.value,
            description: description,
            deadline:    deadline,
            status:      Status.ACTIVE,
            createdAt:   block.timestamp,
            txHash:      ""
        });

        clientEscrows[msg.sender].push(id);
        freelancerEscrows[freelancer].push(id);

        emit EscrowCreated(id, msg.sender, freelancer, msg.value, deadline, description);
        return id;
    }

    /**
     * @notice Client approves the completed work and releases funds to the freelancer.
     * @param escrowId The ID of the escrow to release.
     */
    function releaseFunds(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (msg.sender != e.client) revert OnlyClient();
        if (e.status != Status.ACTIVE) revert EscrowNotActive();

        e.status = Status.RELEASED;
        uint256 amount = e.amount;

        (bool ok, ) = payable(e.freelancer).call{value: amount}("");
        require(ok, "Transfer failed");

        emit FundsReleased(escrowId, e.freelancer, amount);
    }

    /**
     * @notice Freelancer or client can raise a dispute.
     * @param escrowId The ID of the disputed escrow.
     */
    function raiseDispute(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        if (msg.sender != e.client && msg.sender != e.freelancer) revert OnlyClient();
        if (e.status != Status.ACTIVE) revert EscrowNotActive();

        e.status = Status.DISPUTED;
        emit DisputeRaised(escrowId, msg.sender);
    }

    /**
     * @notice Client can reclaim funds if the deadline has passed and work was not approved.
     * @param escrowId The ID of the escrow to refund.
     */
    function refundAfterDeadline(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        if (msg.sender != e.client) revert OnlyClient();
        if (e.status != Status.ACTIVE) revert EscrowNotActive();
        if (block.timestamp < e.deadline) revert DeadlineNotPassed();

        e.status = Status.REFUNDED;
        uint256 amount = e.amount;

        (bool ok, ) = payable(e.client).call{value: amount}("");
        require(ok, "Transfer failed");

        emit EscrowRefunded(escrowId, e.client, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  View helpers
    // ─────────────────────────────────────────────────────────────────────────

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    function getClientEscrows(address client) external view returns (uint256[] memory) {
        return clientEscrows[client];
    }

    function getFreelancerEscrows(address freelancer) external view returns (uint256[] memory) {
        return freelancerEscrows[freelancer];
    }

    function getEscrowCount() external view returns (uint256) {
        return escrowCounter;
    }
}
