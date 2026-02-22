import { useEffect, useState } from "react";
import { useAccounts } from "@midl/react";
import { toast } from "sonner";
import { mockContract, type MockEscrow } from "../contracts/mockContract";
import "./EscrowDetail.css";

interface EscrowDetailDemoProps {
    escrowId: number;
    onBack: () => void;
}

export function EscrowDetailDemo({ escrowId, onBack }: EscrowDetailDemoProps) {
    const { accounts } = useAccounts();
    const [escrow, setEscrow] = useState<MockEscrow | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadEscrow();
    }, [escrowId]);

    const loadEscrow = () => {
        const data = mockContract.getEscrow(escrowId);
        setEscrow(data || null);
    };

    const handleRelease = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        mockContract.releaseFunds(escrowId);
        toast.success("Funds Released!");
        loadEscrow();
        setIsProcessing(false);
    };

    const handleDispute = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        mockContract.raiseDispute(escrowId);
        toast.warning("Dispute Raised");
        loadEscrow();
        setIsProcessing(false);
    };

    const handleRefund = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        mockContract.refundAfterDeadline(escrowId);
        toast.success("Refund Processed");
        loadEscrow();
        setIsProcessing(false);
    };

    if (!escrow) {
        return <div className="escrow-detail"><p>Escrow not found</p></div>;
    }

    const userAddress = accounts?.[0]?.address?.toLowerCase();
    const isClient = escrow.client.toLowerCase() === userAddress;
    const isFreelancer = escrow.freelancer.toLowerCase() === userAddress;
    const isPastDeadline = Date.now() > escrow.deadline;

    const statusText = ["Active", "Completed", "Disputed", "Refunded"][escrow.status];

    return (
        <div className="escrow-detail">
            <button className="back-btn" onClick={onBack}>← Back</button>
            
            <div className="detail-header">
                <h1>Escrow #{escrow.id}</h1>
                <span className="demo-badge">DEMO MODE</span>
                <span className={`status-badge status-${statusText.toLowerCase()}`}>
                    {statusText}
                </span>
            </div>

            <div className="detail-grid">
                <div className="detail-card">
                    <h3>Amount</h3>
                    <p className="amount-large">{escrow.amount} BTC</p>
                </div>

                <div className="detail-card">
                    <h3>Client</h3>
                    <p className="address">{escrow.client}</p>
                </div>

                <div className="detail-card">
                    <h3>Freelancer</h3>
                    <p className="address">{escrow.freelancer}</p>
                </div>

                <div className="detail-card">
                    <h3>Deadline</h3>
                    <p>{new Date(escrow.deadline).toLocaleString()}</p>
                    {isPastDeadline && <span className="text-danger">⚠️ Past deadline</span>}
                </div>
            </div>

            <div className="detail-card">
                <h3>Description</h3>
                <p>{escrow.description}</p>
            </div>

            {escrow.status === 0 && (
                <div className="actions">
                    {isClient && (
                        <>
                            <button
                                className="btn btn-success"
                                onClick={handleRelease}
                                disabled={isProcessing}
                            >
                                ✓ Release Funds
                            </button>
                            <button
                                className="btn btn-warning"
                                onClick={handleDispute}
                                disabled={isProcessing}
                            >
                                ⚠ Raise Dispute
                            </button>
                        </>
                    )}
                    {isFreelancer && (
                        <button
                            className="btn btn-warning"
                            onClick={handleDispute}
                            disabled={isProcessing}
                        >
                            ⚠ Raise Dispute
                        </button>
                    )}
                    {isClient && isPastDeadline && (
                        <button
                            className="btn btn-danger"
                            onClick={handleRefund}
                            disabled={isProcessing}
                        >
                            ↩ Request Refund
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
