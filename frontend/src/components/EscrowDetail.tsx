import { useAccounts } from "@midl/react";
import { useReadContract } from "wagmi";
import {
    useAddTxIntention,
    useFinalizeBTCTransaction,
    useSignIntention,
} from "@midl/executor-react";
import { useWaitForTransaction } from "@midl/react";
import { usePublicClient } from "wagmi";
import { encodeFunctionData } from "viem";
import { useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { BitBondEscrow, EscrowStatusLabels } from "../contracts/BitBondEscrow";
import "./EscrowDetail.css";

interface EscrowDetailProps {
    escrowId: bigint;
    onBack: () => void;
}

type TxStep = "idle" | "finalize" | "sign" | "broadcast" | "done";

const STATUS_COLORS: Record<number, string> = {
    0: "status-pending",
    1: "status-active",
    2: "status-released",
    3: "status-disputed",
    4: "status-refunded",
};

const STATUS_ICONS: Record<number, string> = {
    0: "⏳", 1: "🔒", 2: "✅", 3: "⚠️", 4: "↩️",
};

export function EscrowDetail({ escrowId, onBack }: EscrowDetailProps) {
    const { accounts } = useAccounts();
    const currentAddr = accounts?.[0]?.address?.toLowerCase();

    const { data: escrowRaw, isLoading, refetch } = useReadContract({
        abi: BitBondEscrow.abi,
        address: BitBondEscrow.address,
        functionName: "getEscrow",
        args: [escrowId],
    });

    const { addTxIntention, txIntentions } = useAddTxIntention();
    const { finalizeBTCTransaction, data: btcTxData } = useFinalizeBTCTransaction();
    const { signIntentionAsync } = useSignIntention();
    const publicClient = usePublicClient();

    const [txStep, setTxStep] = useState<TxStep>("idle");
    const [actionType, setActionType] = useState<"release" | "dispute" | "refund" | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const { waitForTransaction } = useWaitForTransaction({
        mutation: {
            onSuccess: () => {
                setTxStep("done");
                refetch();
                toast.success("Transaction confirmed!");
                if (actionType === "release") {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ["#f7931a", "#ffffff", "#22c55e"]
                    });
                }
            }
        },
    });

    if (isLoading) {
        return (
            <div className="detail-loading" id="detail-loading">
                <div className="loading-spinner" />
                <p>Loading escrow…</p>
            </div>
        );
    }

    if (!escrowRaw) {
        return (
            <div className="detail-error" id="detail-error">
                <p>Escrow not found.</p>
                <button className="btn btn-secondary" onClick={onBack}>← Back</button>
            </div>
        );
    }

    const e = escrowRaw as any;
    const status = Number(e.status);
    const amountBTC = (Number(e.amount) / 1e18).toFixed(8);
    const isClient = currentAddr === e.client.toLowerCase();
    const isFreelancer = currentAddr === e.freelancer.toLowerCase();
    const deadline = new Date(Number(e.deadline) * 1000);
    const createdAt = new Date(Number(e.createdAt) * 1000);
    const isDeadlinePassed = deadline < new Date();

    // ── Midl Transaction Flow ──
    // Fix args type error by using any[] or properly typed tuple
    const initAction = async (type: "release" | "dispute" | "refund", fnName: string, args: any[]) => {
        setActionType(type);
        setLoading(true);
        setError(null);
        const toastId = toast.loading("Adding intention...");

        try {
            addTxIntention({
                reset: true,
                intention: {
                    evmTransaction: {
                        to: BitBondEscrow.address,
                        data: encodeFunctionData({
                            abi: BitBondEscrow.abi,
                            functionName: fnName as any,
                            args: args as any, // Cast to any to satisfy Viem's strict typing for now
                        }),
                    },
                },
            });
            setTxStep("finalize");
            toast.success("Intention added!", { id: toastId });
        } catch (err: any) {
            setError(err.message);
            toast.error("Failed to add intention", { description: err.message, id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        setLoading(true);
        setError(null);
        const toastId = toast.loading("Finalizing BTC transaction...");
        try {
            await finalizeBTCTransaction();
            setTxStep("sign");
            toast.success("Ready to sign!", { id: toastId });
        } catch (err: any) {
            setError(err.message);
            toast.error("Finalize failed", { description: err.message, id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async () => {
        if (!btcTxData) return;
        setLoading(true);
        const toastId = toast.loading("Waiting for signature...");
        setError(null);
        try {
            for (const intention of txIntentions) {
                await signIntentionAsync({ intention, txId: btcTxData.tx.id });
            }
            setTxStep("broadcast");
            toast.success("Signed!", { id: toastId });
        } catch (err: any) {
            setError(err.message);
            toast.error("Signing failed", { description: err.message, id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!btcTxData || !publicClient) return;
        setLoading(true);
        setError(null);
        const toastId = toast.loading("Broadcasting...");
        try {
            await (publicClient as any).sendBTCTransactions({
                serializedTransactions: txIntentions.map((it) => it.signedEvmTransaction as `0x${string}`),
                btcTransaction: btcTxData.tx.hex,
            });
            setTxHash(btcTxData.tx.id);
            waitForTransaction({ txId: btcTxData.tx.id });
            toast.success("Broadcasted! Waiting for block...", { id: toastId });
        } catch (err: any) {
            setError(err.message);
            toast.error("Broadcast failed", { description: err.message, id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setTxStep("idle");
        setActionType(null);
        setError(null);
    };

    // Logic helpers for UI states
    const isFinalizeActive = txStep === "finalize";
    const isSignActive = txStep === "sign";
    const isBroadcastActive = txStep === "broadcast";

    const isFinalizeDone = ["sign", "broadcast", "done"].includes(txStep);
    const isSignDone = ["broadcast", "done"].includes(txStep);
    const isBroadcastDone = txStep === "done";

    return (
        <div className="detail" id={`escrow-detail-${escrowId}`}>
            {/* Back */}
            <button className="back-btn" onClick={onBack}>
                ← Back to Dashboard
            </button>

            {/* Hero Card */}
            <div className="detail-hero">
                <div className="detail-hero-left">
                    <div className="detail-id">Escrow #{escrowId.toString()}</div>
                    <h1 className="detail-desc">{e.description}</h1>
                    <div className="detail-tags">
                        <span className={`status-badge ${STATUS_COLORS[status]}`}>
                            {STATUS_ICONS[status]} {EscrowStatusLabels[status]}
                        </span>
                        {isClient && <span className="role-badge role-client">You are Client</span>}
                        {isFreelancer && <span className="role-badge role-freelancer">You are Freelancer</span>}
                    </div>
                </div>
                <div className="detail-amount-block">
                    <div className="detail-amount">₿ {amountBTC}</div>
                    <div className="detail-amount-label">
                        {status === 1 ? "🔒 Locked On-Chain" : status === 2 ? "✅ Released" : ""}
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="info-grid">
                <div className="info-item">
                    <span className="info-label">Client</span>
                    <a
                        className="info-value info-address"
                        href={`https://blockscout.staging.midl.xyz/address/${e.client}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {e.client.slice(0, 12)}…{e.client.slice(-8)} ↗
                    </a>
                </div>
                <div className="info-item">
                    <span className="info-label">Freelancer</span>
                    <a
                        className="info-value info-address"
                        href={`https://blockscout.staging.midl.xyz/address/${e.freelancer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {e.freelancer.slice(0, 12)}…{e.freelancer.slice(-8)} ↗
                    </a>
                </div>
                <div className="info-item">
                    <span className="info-label">Created</span>
                    <span className="info-value">{createdAt.toLocaleString()}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Deadline</span>
                    <span className={`info-value ${isDeadlinePassed && status === 1 ? "text-red" : ""}`}>
                        {deadline.toLocaleString()}
                        {isDeadlinePassed && status === 1 && " ⚠️ Passed"}
                    </span>
                </div>
            </div>

            {/* TX Hash (if exists) */}
            {txHash && (
                <div className="tx-proof-card">
                    <span className="tx-proof-label">🧾 On-Chain Proof</span>
                    <a
                        href={`https://blockscout.staging.midl.xyz/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-proof-hash"
                    >
                        {txHash} ↗
                    </a>
                </div>
            )}

            {/* Action Panel */}
            {txStep === "idle" && status === 1 && (
                <div className="action-panel">
                    <h3 className="action-panel-title">Actions</h3>
                    <div className="action-buttons">
                        {isClient && (
                            <>
                                <button
                                    className="btn btn-release"
                                    onClick={() => initAction("release", "releaseFunds", [escrowId])}
                                    disabled={loading}
                                >
                                    ✅ Approve & Release Funds
                                </button>
                                {isDeadlinePassed && (
                                    <button
                                        className="btn btn-refund"
                                        onClick={() => initAction("refund", "refundAfterDeadline", [escrowId])}
                                        disabled={loading}
                                    >
                                        ↩️ Refund (Deadline Passed)
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            className="btn btn-dispute"
                            onClick={() => initAction("dispute", "raiseDispute", [escrowId])}
                            disabled={loading}
                        >
                            ⚠️ Raise Dispute
                        </button>
                    </div>
                </div>
            )}

            {/* Midl Multi-step TX flow */}
            {txStep !== "idle" && txStep !== "done" && (
                <div className="tx-flow-card">
                    <div className="tx-flow-header">
                        <span className="tx-flow-title">
                            {actionType === "release" ? "🔓 Releasing Funds" :
                                actionType === "dispute" ? "⚠️ Raising Dispute" : "↩️ Processing Refund"}
                        </span>
                        <button className="btn-cancel" onClick={resetFlow}>Cancel</button>
                    </div>
                    {error && <div className="error-box">{error}</div>}
                    <div className="tx-flow-steps">
                        <button
                            className={`tx-step-btn ${isFinalizeActive ? "active" : isFinalizeDone ? "done" : ""}`}
                            onClick={handleFinalize}
                            disabled={loading || !isFinalizeActive}
                        >
                            {loading && isFinalizeActive ? <span className="spinner" /> : null}
                            1. Finalize BTC Transaction
                        </button>
                        <button
                            className={`tx-step-btn ${isSignActive ? "active" : isSignDone ? "done" : ""}`}
                            onClick={handleSign}
                            disabled={loading || !isSignActive}
                        >
                            {loading && isSignActive ? <span className="spinner" /> : null}
                            2. Sign with Xverse
                        </button>
                        <button
                            className={`tx-step-btn ${isBroadcastActive ? "active" : isBroadcastDone ? "done" : ""}`}
                            onClick={handleBroadcast}
                            disabled={loading || !isBroadcastActive}
                        >
                            {loading && isBroadcastActive ? <span className="spinner" /> : null}
                            3. Broadcast to Bitcoin
                        </button>
                    </div>
                </div>
            )}

            {txStep === "done" && (
                <div className="success-card">
                    <span className="success-icon">🎉</span>
                    <h3>Transaction Complete!</h3>
                    <p>The action has been confirmed on-chain.</p>
                    {txHash && (
                        <a
                            href={`https://blockscout.staging.midl.xyz/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="explorer-link"
                        >
                            View on Explorer ↗
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
