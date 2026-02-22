import { useEffect, useState } from "react";
import { useAccounts } from "@midl/react";
import { mockContract, type MockEscrow } from "../contracts/mockContract";
import "./Dashboard.css";

interface DashboardDemoProps {
    onViewEscrow: (id: number) => void;
}

export function DashboardDemo({ onViewEscrow }: DashboardDemoProps) {
    const { accounts } = useAccounts();
    const [escrows, setEscrows] = useState<MockEscrow[]>([]);
    const [filter, setFilter] = useState<"all" | "client" | "freelancer">("all");

    useEffect(() => {
        loadEscrows();
    }, [accounts, filter]);

    const loadEscrows = () => {
        const allEscrows = mockContract.getAllEscrows();
        const userAddress = accounts?.[0]?.address?.toLowerCase();

        let filtered = allEscrows;
        if (filter === "client") {
            filtered = allEscrows.filter(e => e.client.toLowerCase() === userAddress);
        } else if (filter === "freelancer") {
            filtered = allEscrows.filter(e => e.freelancer.toLowerCase() === userAddress);
        }

        setEscrows(filtered.reverse());
    };

    const getStatusBadge = (status: number) => {
        const badges = {
            0: { text: "Active", class: "status-active" },
            1: { text: "Completed", class: "status-completed" },
            2: { text: "Disputed", class: "status-disputed" },
            3: { text: "Refunded", class: "status-refunded" },
        };
        return badges[status as keyof typeof badges] || badges[0];
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>My Escrows</h1>
                <span className="demo-badge">DEMO MODE</span>
            </div>

            <div className="filter-tabs">
                <button
                    className={filter === "all" ? "active" : ""}
                    onClick={() => setFilter("all")}
                >
                    All
                </button>
                <button
                    className={filter === "client" ? "active" : ""}
                    onClick={() => setFilter("client")}
                >
                    As Client
                </button>
                <button
                    className={filter === "freelancer" ? "active" : ""}
                    onClick={() => setFilter("freelancer")}
                >
                    As Freelancer
                </button>
            </div>

            <div className="escrows-grid">
                {escrows.length === 0 ? (
                    <div className="empty-state">
                        <p>No escrows found</p>
                        <p className="text-muted">Create your first escrow to get started</p>
                    </div>
                ) : (
                    escrows.map((escrow) => {
                        const badge = getStatusBadge(escrow.status);
                        return (
                            <div key={escrow.id} className="escrow-card">
                                <div className="escrow-card-header">
                                    <span className="escrow-id">#{escrow.id}</span>
                                    <span className={`status-badge ${badge.class}`}>
                                        {badge.text}
                                    </span>
                                </div>
                                <div className="escrow-card-body">
                                    <p className="escrow-description">{escrow.description}</p>
                                    <div className="escrow-amount">{escrow.amount} BTC</div>
                                    <div className="escrow-meta">
                                        <span>Deadline: {new Date(escrow.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => onViewEscrow(escrow.id)}
                                >
                                    View Details
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
