import { useAccounts } from "@midl/react";
import { useReadContract } from "wagmi";
import { BitBondEscrow, EscrowStatusLabels } from "../contracts/BitBondEscrow";
import "./Dashboard.css";

interface DashboardProps {
    onViewEscrow: (id: bigint) => void;
    onCreateEscrow: () => void;
}

const STATUS_COLORS: Record<number, string> = {
    0: "status-pending",
    1: "status-active",
    2: "status-released",
    3: "status-disputed",
    4: "status-refunded",
};

const STATUS_ICONS: Record<number, string> = {
    0: "⏳",
    1: "🔒",
    2: "✅",
    3: "⚠️",
    4: "↩️",
};

export function Dashboard({ onViewEscrow, onCreateEscrow }: DashboardProps) {
    const { accounts } = useAccounts();
    const evmAddress = accounts?.[0]?.address as `0x${string}` | undefined;

    const { data: clientIds, isLoading: clientLoading } = useReadContract({
        abi: BitBondEscrow.abi,
        address: BitBondEscrow.address,
        functionName: "getClientEscrows",
        args: evmAddress ? [evmAddress] : undefined,
        query: { enabled: !!evmAddress },
    });

    const { data: freelancerIds, isLoading: freelancerLoading } = useReadContract({
        abi: BitBondEscrow.abi,
        address: BitBondEscrow.address,
        functionName: "getFreelancerEscrows",
        args: evmAddress ? [evmAddress] : undefined,
        query: { enabled: !!evmAddress },
    });

    const isLoading = clientLoading || freelancerLoading;

    const allIds = [
        ...((clientIds as bigint[]) || []),
        ...((freelancerIds as bigint[]) || []),
    ].filter((v, i, a) => a.findIndex((x) => x === v) === i);

    return (
        <div className="dashboard" id="dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">My Escrows</h1>
                    <p className="dashboard-subtitle">
                        {evmAddress
                            ? `${evmAddress.slice(0, 10)}…${evmAddress.slice(-8)}`
                            : ""}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    id="dashboard-create-btn"
                    onClick={onCreateEscrow}
                >
                    + New Escrow
                </button>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-card-icon">📤</span>
                    <div>
                        <div className="stat-card-val">{(clientIds as bigint[])?.length ?? "—"}</div>
                        <div className="stat-card-label">As Client</div>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-card-icon">📥</span>
                    <div>
                        <div className="stat-card-val">{(freelancerIds as bigint[])?.length ?? "—"}</div>
                        <div className="stat-card-label">As Freelancer</div>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-card-icon">🔒</span>
                    <div>
                        <div className="stat-card-val">{allIds.length}</div>
                        <div className="stat-card-label">Total</div>
                    </div>
                </div>
            </div>

            {/* Escrow List */}
            {isLoading ? (
                <div className="loading-state" id="dashboard-loading">
                    <div className="loading-spinner" />
                    <p>Loading escrows…</p>
                </div>
            ) : allIds.length === 0 ? (
                <div className="empty-state" id="dashboard-empty">
                    <span className="empty-icon">🤝</span>
                    <h3>No escrows yet</h3>
                    <p>Create your first escrow to securely lock Bitcoin for a freelance project.</p>
                    <button
                        className="btn btn-primary"
                        id="empty-create-btn"
                        onClick={onCreateEscrow}
                    >
                        Create First Escrow
                    </button>
                </div>
            ) : (
                <div className="escrow-list" id="escrow-list">
                    {allIds.map((id) => (
                        <EscrowListItem
                            key={id.toString()}
                            escrowId={id}
                            currentAddress={evmAddress}
                            onView={() => onViewEscrow(id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function EscrowListItem({
    escrowId,
    currentAddress,
    onView,
}: {
    escrowId: bigint;
    currentAddress?: `0x${string}`;
    onView: () => void;
}) {
    const { data: escrow, isLoading } = useReadContract({
        abi: BitBondEscrow.abi,
        address: BitBondEscrow.address,
        functionName: "getEscrow",
        args: [escrowId],
    });

    if (isLoading || !escrow) {
        return (
            <div className="escrow-card skeleton" id={`escrow-skeleton-${escrowId}`}>
                <div className="skeleton-line" style={{ width: "40%" }} />
                <div className="skeleton-line" style={{ width: "70%" }} />
            </div>
        );
    }

    const e = escrow as any;
    const status = Number(e.status);
    const isClient = currentAddress?.toLowerCase() === e.client.toLowerCase();
    const amountBTC = (Number(e.amount) / 1e18).toFixed(6);
    const deadlineDate = new Date(Number(e.deadline) * 1000).toLocaleDateString();
    const shortDesc =
        e.description.length > 60
            ? e.description.slice(0, 60) + "…"
            : e.description;

    return (
        <div
            className="escrow-card"
            id={`escrow-card-${escrowId}`}
            onClick={onView}
            role="button"
            tabIndex={0}
            onKeyDown={(ev) => ev.key === "Enter" && onView()}
        >
            <div className="escrow-card-left">
                <div className="escrow-card-top">
                    <span className="escrow-id">#{escrowId.toString()}</span>
                    <span className={`status-badge ${STATUS_COLORS[status]}`}>
                        {STATUS_ICONS[status]} {EscrowStatusLabels[status]}
                    </span>
                    <span className={`role-badge ${isClient ? "role-client" : "role-freelancer"}`}>
                        {isClient ? "Client" : "Freelancer"}
                    </span>
                </div>
                <p className="escrow-desc">{shortDesc}</p>
                <div className="escrow-meta">
                    <span>📅 Due: {deadlineDate}</span>
                    <span>
                        {isClient
                            ? `👤 Freelancer: ${e.freelancer.slice(0, 8)}…`
                            : `👤 Client: ${e.client.slice(0, 8)}…`}
                    </span>
                </div>
            </div>
            <div className="escrow-card-right">
                <div className="escrow-amount">₿ {amountBTC}</div>
                <div className="escrow-amount-label">Locked</div>
                <button
                    className="btn-view"
                    id={`view-escrow-${escrowId}`}
                    onClick={(e) => { e.stopPropagation(); onView(); }}
                >
                    View →
                </button>
            </div>
        </div>
    );
}
