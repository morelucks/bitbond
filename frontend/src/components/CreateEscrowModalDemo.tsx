import { useState } from "react";
import { useAccounts } from "@midl/react";
import { toast } from "sonner";
import { mockContract } from "../contracts/mockContract";
import "./CreateEscrowModal.css";

interface CreateEscrowModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateEscrowModalDemo({ onClose, onSuccess }: CreateEscrowModalProps) {
    const { accounts } = useAccounts();
    const [freelancer, setFreelancer] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!accounts?.[0]?.address) {
            toast.error("Please connect your wallet first");
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const deadlineTimestamp = new Date(deadline).getTime();
            
            const escrow = mockContract.createEscrow(
                freelancer,
                amount,
                description,
                deadlineTimestamp,
                accounts[0].address
            );

            toast.success("Escrow Created!", {
                description: `Escrow #${escrow.id} created successfully (Demo Mode)`
            });

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error creating escrow:", error);
            toast.error("Failed to create escrow", {
                description: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Escrow</h2>
                    <span className="demo-badge">DEMO MODE</span>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="escrow-form">
                    <div className="form-group">
                        <label>Freelancer Address</label>
                        <input
                            type="text"
                            value={freelancer}
                            onChange={(e) => setFreelancer(e.target.value)}
                            placeholder="0x..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount (BTC)</label>
                        <input
                            type="number"
                            step="0.001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Project details..."
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Deadline</label>
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Escrow"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
