import { AddressPurpose } from "@midl/core";
import { useConnect, useAccounts, useDisconnect } from "@midl/react";
import { useState } from "react";
import { toast } from "sonner";
import "./Header.css";

interface HeaderProps {
    onDashboardClick: () => void;
    onHomeClick: () => void;
    onCreateClick: () => void;
}

export function Header({ onDashboardClick, onHomeClick, onCreateClick }: HeaderProps) {
    const { accounts, isConnected } = useAccounts();
    const { connectors, connect, error } = useConnect();
    const { disconnect } = useDisconnect();
    const [showMenu, setShowMenu] = useState(false);

    const btcAddress = accounts?.[0]?.address;
    const shortAddr = btcAddress
        ? `${btcAddress.slice(0, 8)}…${btcAddress.slice(-6)}`
        : "";

    const handleConnect = async (connector: any) => {
        try {
            console.log("Connecting to:", connector.name, connector.id);
            // Midl useConnect usually takes { connector } or { id }
            // We'll try passing the connector object which is standard wagmi v2
            connect({ connector });
        } catch (err: any) {
            console.error("Connect error:", err);
            toast.error("Failed to connect wallet", { description: err.message });
        }
    };

    if (error) {
        console.error("useConnect error state:", error);
    }

    return (
        <header className="header">
            <div className="header-inner">
                {/* Logo */}
                <button className="logo-btn" onClick={onHomeClick}>
                    <span className="logo-icon">₿</span>
                    <span className="logo-text">
                        Bit<span className="logo-accent">Bond</span>
                    </span>
                </button>

                <nav className="nav">
                    <button className="nav-link" onClick={onHomeClick}>
                        Home
                    </button>
                    {isConnected && (
                        <button className="nav-link" onClick={onDashboardClick}>
                            Dashboard
                        </button>
                    )}
                    {isConnected && (
                        <button className="btn btn-primary btn-sm" onClick={onCreateClick}>
                            + New Escrow
                        </button>
                    )}
                </nav>

                <div className="wallet-section">
                    {!isConnected ? (
                        <div className="connectors">
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    className="btn btn-wallet"
                                    onClick={() => handleConnect(connector)}
                                >
                                    <span className="wallet-icon">🔗</span>
                                    Connect {connector.name}
                                </button>
                            ))}
                            {connectors.length === 0 && (
                                <div className="no-connectors">
                                    No wallets found. Install Xverse.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="wallet-connected">
                            <button
                                className="wallet-address-btn"
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                <span className="wallet-dot" />
                                <span className="wallet-addr">{shortAddr}</span>
                                <span className="wallet-chevron">▾</span>
                            </button>
                            {showMenu && (
                                <div className="wallet-dropdown">
                                    <div className="wallet-full-addr">{btcAddress}</div>
                                    <button
                                        className="disconnect-btn"
                                        onClick={() => { disconnect(); setShowMenu(false); }}
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
