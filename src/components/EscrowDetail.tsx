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
    const { waitForTransaction } = useWaitForTransaction({
        mutation: { onSuccess: () => { setTxStep("done"); refetch(); } },
    });

    const [txStep, setTxStep] = useState<TxStep>("idle");
    const [actionType, setActionType] = useState<"release" | "dispute" | "refund" | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

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
    const initAction = async (type: "release" | "dispute" | "refund", fnName: string, args: any[]) => {
        setActionType(type);
        setLoading(true);
        setError(null);
        try {
            addTxIntention({
                reset: true,
                intention: {
                    evmTransaction: {
                        to: BitBondEscrow.address,
                        data: encodeFunctionData({
                            abi: BitBondEscrow.abi,
                            functionName: fnName as any,
                            args,
                        }),
                    },
                },
            });
            setTxStep("finalize");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        setLoading(true);
        setError(null);
        try {
            await finalizeBTCTransaction();
            setTxStep("sign");
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleSign = async () => {
        if (!btcTxData) return;
        setLoading(true);
        setError(null);
        try {
            for (const intention of txIntentions) {
                await signIntentionAsync({ intention, txId: btcTxData.tx.id });
            }
            setTxStep("broadcast");
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleBroadcast = async () => {
        if (!btcTxData || !publicClient) return;
        setLoading(true);
        setError(null);
        try {
            await publicClient.sendBTCTransactions({
                serializedTransactions: txIntentions.map((it) => it.signedEvmTransaction as `0x${string}`),
                btcTransaction: btcTxData.tx.hex,
            });
            setTxHash(btcTxData.tx.id);
            waitForTransaction({ txId: btcTxData.tx.id });
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    const resetFlow = () => {
        setTxStep("idle");
        setActionType(null);
        setError(null);
    };

    return (
        <div className="detail" id={`escrow-detail-${escrowId}`}>
            {/* Back */}
            <button className="back-btn" id="detail-back-btn" onClick={onBack}>
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
                        id="client-address-link"
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
                        id="freelancer-address-link"
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
                <div className="tx-proof-card" id="tx-proof-card">
                    <span className="tx-proof-label">🧾 On-Chain Proof</span>
                    <a
                        href={`https://blockscout.staging.midl.xyz/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-proof-hash"
                        id="tx-proof-link"
                    >
                        {txHash} ↗
                    </a>
                </div>
            )}

            {/* Action Panel */}
            {txStep === "idle" && status === 1 && (
                <div className="action-panel" id="action-panel">
                    <h3 className="action-panel-title">Actions</h3>
                    <div className="action-buttons">
                        {isClient && (
                            <>
                                <button
                                    className="btn btn-release"
                                    id="btn-release-funds"
                                    onClick={() => initAction("release", "releaseFunds", [escrowId])}
                                    disabled={loading}
                                >
                                    ✅ Approve & Release Funds
                                </button>
                                {isDeadlinePassed && (
                                    <button
                                        className="btn btn-refund"
                                        id="btn-refund"
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
                            id="btn-dispute"
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
                <div className="tx-flow-card" id="tx-flow-card">
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
                            className={`tx-step-btn ${txStep === "finalize" ? "active" : txStep !== "idle" ? "done" : ""}`}
                            id="txflow-finalize"
                            onClick={handleFinalize}
                            disabled={loading || txStep !== "finalize"}
                        >
                            {loading && txStep === "finalize" ? <span className="spinner" /> : null}
                            1. Finalize BTC Transaction
                        </button>
                        <button
                            className={`tx-step-btn ${txStep === "sign" ? "active" : (txStep === "broadcast" || txStep === "done") ? "done" : ""}`}
                            id="txflow-sign"
                            onClick={handleSign}
                            disabled={loading || txStep !== "sign"}
                        >
                            {loading && txStep === "sign" ? <span className="spinner" /> : null}
                            2. Sign with Xverse
                        </button>
                        <button
                            className={`tx-step-btn ${txStep === "broadcast" ? "active" : txStep === "done" ? "done" : ""}`}
                            id="txflow-broadcast"
                            onClick={handleBroadcast}
                            disabled={loading || txStep !== "broadcast"}
                        >
                            {loading && txStep === "broadcast" ? <span className="spinner" /> : null}
                            3. Broadcast to Bitcoin
                        </button>
                    </div>
                </div>
            )}

            {txStep === "done" && (
                <div className="success-card" id="success-card">
                    <span className="success-icon">🎉</span>
                    <h3>Transaction Complete!</h3>
                    <p>The action has been confirmed on-chain.</p>
                    {txHash && (
                        <a
                            href={`https://blockscout.staging.midl.xyz/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="explorer-link"
                            id="success-explorer-link"
                        >
                            View on Explorer ↗
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
