// BitBondEscrow contract artifact
// Deployed on Midl Regtest
// Update the address after deploying via: npx hardhat deploy --network regtest

export const BitBondEscrow = {
    // Replace with your deployed contract address after running: npx hardhat deploy
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,

    abi: [
        {
            inputs: [],
            name: "AlreadyReleased",
            type: "error",
        },
        {
            inputs: [],
            name: "DeadlineMustBeFuture",
            type: "error",
        },
        {
            inputs: [],
            name: "DeadlineNotPassed",
            type: "error",
        },
        {
            inputs: [],
            name: "EscrowNotActive",
            type: "error",
        },
        {
            inputs: [],
            name: "InvalidAddress",
            type: "error",
        },
        {
            inputs: [],
            name: "InvalidAmount",
            type: "error",
        },
        {
            inputs: [],
            name: "OnlyClient",
            type: "error",
        },
        {
            inputs: [],
            name: "OnlyFreelancer",
            type: "error",
        },
        {
            inputs: [],
            name: "ReentrantCall",
            type: "error",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
                { indexed: true, internalType: "address", name: "raisedBy", type: "address" },
            ],
            name: "DisputeRaised",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
                { indexed: true, internalType: "address", name: "client", type: "address" },
                { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "EscrowRefunded",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
                { indexed: true, internalType: "address", name: "client", type: "address" },
                { indexed: true, internalType: "address", name: "freelancer", type: "address" },
                { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
                { indexed: false, internalType: "uint256", name: "deadline", type: "uint256" },
                { indexed: false, internalType: "string", name: "description", type: "string" },
            ],
            name: "EscrowCreated",
            type: "event",
        },
        {
            anonymous: false,
            inputs: [
                { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
                { indexed: true, internalType: "address", name: "freelancer", type: "address" },
                { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "FundsReleased",
            type: "event",
        },
        {
            inputs: [
                { internalType: "address", name: "freelancer", type: "address" },
                { internalType: "string", name: "description", type: "string" },
                { internalType: "uint256", name: "deadline", type: "uint256" },
            ],
            name: "createEscrow",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "payable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
            name: "releaseFunds",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
            name: "raiseDispute",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
            name: "refundAfterDeadline",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
        },
        {
            inputs: [{ internalType: "uint256", name: "escrowId", type: "uint256" }],
            name: "getEscrow",
            outputs: [
                {
                    components: [
                        { internalType: "uint256", name: "id", type: "uint256" },
                        { internalType: "address", name: "client", type: "address" },
                        { internalType: "address", name: "freelancer", type: "address" },
                        { internalType: "uint256", name: "amount", type: "uint256" },
                        { internalType: "string", name: "description", type: "string" },
                        { internalType: "uint256", name: "deadline", type: "uint256" },
                        { internalType: "uint8", name: "status", type: "uint8" },
                        { internalType: "uint256", name: "createdAt", type: "uint256" },
                        { internalType: "string", name: "txHash", type: "string" },
                    ],
                    internalType: "struct BitBondEscrow.Escrow",
                    name: "",
                    type: "tuple",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "client", type: "address" }],
            name: "getClientEscrows",
            outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [{ internalType: "address", name: "freelancer", type: "address" }],
            name: "getFreelancerEscrows",
            outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "escrowCounter",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [],
            name: "getEscrowCount",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
        },
    ] as const,
};

export type EscrowStatus = 0 | 1 | 2 | 3 | 4;
export const EscrowStatusLabels: Record<number, string> = {
    0: "PENDING",
    1: "ACTIVE",
    2: "RELEASED",
    3: "DISPUTED",
    4: "REFUNDED",
};
