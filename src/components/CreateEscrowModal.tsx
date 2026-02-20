import { useState } from "react";
import { useAccounts } from "@midl/react";
import {
    useAddTxIntention,
    useFinalizeBTCTransaction,
    useSignIntention,
} from "@midl/executor-react";
import { useWaitForTransaction } from "@midl/react";
import { usePublicClient } from "wagmi";
import { encodeFunctionData, parseEther } from "viem";
import { BitBondEscrow } from "../contracts/BitBondEscrow";
import "./CreateEscrowModal.css";

interface CreateEscrowModalProps {
    onClose: () => void;
    onSuccess: (escrowId: bigint) => void;
}

type Step = "form" | "intention" | "finalize" | "sign" | "broadcast" | "done";

export function CreateEscrowModal({ onClose, onSuccess }: CreateEscrowModalProps) {
    const { accounts } = useAccounts();
    const { addTxIntention, txIntentions } = useAddTxIntention();
    const { finalizeBTCTransaction, data: btcTxData } = useFinalizeBTCTransaction();
    const { signIntentionAsync } = useSignIntention();
    const publicClient = usePublicClient();
    const { waitForTransaction } = useWaitForTransaction({
        mutation: {
            onSuccess: () => {
                setStep("done");
            },
        },
    });

    const [step, setStep] = useState<Step>("form");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const [form, setForm] = useState({
        freelancer: "",
        amount: "",
        description: "",
        deadline: "",
    });

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError(null);
    };

    const validate = () => {
        if (!form.freelancer || !form.freelancer.startsWith("0x"))
            return "Enter a valid EVM address for the freelancer (0x...)";
        if (!form.amount || parseFloat(form.amount) <= 0)
            return "Enter a valid payment amount";
        if (!form.description.trim())
            return "Please describe the work to be done";
        if (!form.deadline)
            return "Set a deadline for the work";
        if (new Date(form.deadline) <= new Date())
            return "Deadline must be in the future";
        return null;
    };

    // Step 1: Add transaction intention
    const handleAddIntention = async () => {
        const err = validate();
        if (err) { setError(err); return; }
        setLoading(true);
        setError(null);
        try {
            const deadlineTs = BigInt(Math.floor(new Date(form.deadline).getTime() / 1000));
            addTxIntention({
                reset: true,
                intention: {
                    evmTransaction: {
                        to: BitBondEscrow.address,
                        value: parseEther(form.amount),
                        data: encodeFunctionData({
                            abi: BitBondEscrow.abi,
                            functionName: "createEscrow",
                            args: [form.freelancer as `0x${string}`, form.description, deadlineTs],
                        }),
                    },
                },
            });
            setStep("finalize");
        } catch (e: any) {
            setError(e.message || "Failed to add transaction intention");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Finalize BTC transaction
    const handleFinalize = async () => {
        setLoading(true);
        setError(null);
        try {
            await finalizeBTCTransaction();
            setStep("sign");
        } catch (e: any) {
            setError(e.message || "Failed to finalize BTC transaction");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Sign all intentions
    const handleSign = async () => {
        if (!btcTxData) { setError("BTC transaction not finalized yet"); return; }
        setLoading(true);
        setError(null);
        try {
            for (const intention of txIntentions) {
                await signIntentionAsync({ intention, txId: btcTxData.tx.id });
            }
            setStep("broadcast");
        } catch (e: any) {
            setError(e.message || "Failed to sign intentions");
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Broadcast
    const handleBroadcast = async () => {
        if (!btcTxData) { setError("BTC transaction not finalized yet"); return; }
        if (!publicClient) { setError("No public client available"); return; }
        setLoading(true);
        setError(null);
        try {
            await publicClient.sendBTCTransactions({
                serializedTransactions: txIntentions.map(
                    (it) => it.signedEvmTransaction as `0x${string}`
                ),
                btcTransaction: btcTxData.tx.hex,
            });
            setTxHash(btcTxData.tx.id);
            waitForTransaction({ txId: btcTxData.tx.id });
        } catch (e: any) {
            setError(e.message || "Failed to broadcast transaction");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { key: "form", label: "Fill Details" },
        { key: "finalize", label: "Prepare TX" },
        { key: "sign", label: "Sign" },
        { key: "broadcast", label: "Broadcast" },
        { key: "done", label: "Complete" },
    ];
    const stepIdx = steps.findIndex((s) => s.key === step || (step === "intention" && s.key === "form"));

    return (
        <div className="modal-backdrop" id="create-escrow-modal" onClick={(e) => {
            if ((e.target as HTMLElement).classList.contains("modal-backdrop")) onClose();
        }}>
            <div className="modal">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Create Escrow</h2>
                        <p className="modal-subtitle">Lock BTC funds until work is approved</p>
                    </div>
                    <button className="modal-close" id="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Progress */}
                <div className="step-progress">
                    {steps.map((s, i) => (
                        <div key={s.key} className={`step-item ${i < stepIdx ? "done" : i === stepIdx ? "active" : ""}`}>
                            <div className="step-circle">{i < stepIdx ? "✓" : i + 1}</div>
                            <span className="step-label">{s.label}</span>
                            {i < steps.length - 1 && <div className="step-line" />}
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* STEP: Form */}
                    {(step === "form" || step === "intention") && (
                        <div className="form">
                            <div className="field">
                                <label className="field-label" htmlFor="freelancer-addr">Freelancer EVM Address</label>
                                <input
                                    id="freelancer-addr"
                                    className="field-input"
                                    type="text"
                                    placeholder="0x..."
                                    value={form.freelancer}
                                    onChange={(e) => handleChange("freelancer", e.target.value)}
                                />
                            </div>
                            <div className="field-row">
                                <div className="field">
                                    <label className="field-label" htmlFor="amount-input">Amount (BTC)</label>
                                    <input
                                        id="amount-input"
                                        className="field-input"
                                        type="number"
                                        step="0.00001"
                                        min="0"
                                        placeholder="0.001"
                                        value={form.amount}
                                        onChange={(e) => handleChange("amount", e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label className="field-label" htmlFor="deadline-input">Deadline</label>
                                    <input
                                        id="deadline-input"
                                        className="field-input"
                                        type="datetime-local"
                                        value={form.deadline}
                                        onChange={(e) => handleChange("deadline", e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="field-label" htmlFor="description-input">Work Description</label>
                                <textarea
                                    id="description-input"
                                    className="field-input field-textarea"
                                    rows={4}
                                    placeholder="Describe the agreed scope of work in detail..."
                                    value={form.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                />
                            </div>

                            {error && <div className="error-box" id="form-error">{error}</div>}

                            <button
                                className="btn btn-primary btn-full"
                                id="btn-add-intention"
                                onClick={handleAddIntention}
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" /> : null}
                                Add Transaction Intention →
                            </button>
                        </div>
                    )}

                    {/* STEP: Finalize */}
                    {step === "finalize" && (
                        <div className="step-action">
                            <div className="step-icon">⚙️</div>
                            <h3>Calculate Transaction Costs</h3>
                            <p>Midl will calculate the optimal Bitcoin fee and prepare the BTC transaction that anchors your escrow on-chain.</p>
                            {error && <div className="error-box">{error}</div>}
                            <button
                                className="btn btn-primary btn-full"
                                id="btn-finalize"
                                onClick={handleFinalize}
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" /> : null}
                                Finalize BTC Transaction →
                            </button>
                        </div>
                    )}

                    {/* STEP: Sign */}
                    {step === "sign" && (
                        <div className="step-action">
                            <div className="step-icon">✍️</div>
                            <h3>Sign with Xverse</h3>
                            <p>Your Xverse wallet will prompt you to sign the transaction. This authorizes locking your funds in the BitBond escrow contract.</p>
                            {error && <div className="error-box">{error}</div>}
                            <button
                                className="btn btn-primary btn-full"
                                id="btn-sign"
                                onClick={handleSign}
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" /> : null}
                                Sign with Xverse →
                            </button>
                        </div>
                    )}

                    {/* STEP: Broadcast */}
                    {step === "broadcast" && (
                        <div className="step-action">
                            <div className="step-icon">📡</div>
                            <h3>Broadcast to Bitcoin</h3>
                            <p>Your signed transaction will be broadcast to the Bitcoin network via Midl RPC. Funds will be locked in the escrow contract.</p>
                            {error && <div className="error-box">{error}</div>}
                            <button
                                className="btn btn-primary btn-full"
                                id="btn-broadcast"
                                onClick={handleBroadcast}
                                disabled={loading}
                            >
                                {loading ? <span className="spinner" /> : null}
                                Broadcast Transaction →
                            </button>
                            {txHash && (
                                <div className="tx-hash-box">
                                    <span className="tx-label">TX Hash:</span>
                                    <span className="tx-value">{txHash}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP: Done */}
                    {step === "done" && (
                        <div className="step-action success">
                            <div className="step-icon success-icon">🎉</div>
                            <h3>Escrow Created!</h3>
                            <p>Your funds are now securely locked on-chain. The freelancer will be notified and can begin work.</p>
                            {txHash && (
                                <div className="tx-hash-box">
                                    <span className="tx-label">TX Hash:</span>
                                    <a
                                        href={`https://blockscout.staging.midl.xyz/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="tx-link"
                                        id="tx-explorer-link"
                                    >
                                        {txHash.slice(0, 20)}…{txHash.slice(-10)} ↗
                                    </a>
                                </div>
                            )}
                            <button
                                className="btn btn-primary btn-full"
                                id="btn-view-escrow"
                                onClick={() => onSuccess(1n)} // ID will come from contract event in production
                            >
                                View Escrow →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
