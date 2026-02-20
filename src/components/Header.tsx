import { AddressPurpose } from "@midl/core";
import { useConnect, useAccounts, useDisconnect } from "@midl/react";
import { useState } from "react";
import "./Header.css";

interface HeaderProps {
    onDashboardClick: () => void;
    onHomeClick: () => void;
    onCreateClick: () => void;
}

export function Header({ onDashboardClick, onHomeClick, onCreateClick }: HeaderProps) {
    const { accounts, isConnected } = useAccounts();
    const { connectors, connect } = useConnect({ purposes: [AddressPurpose.Ordinals] });
    const { disconnect } = useDisconnect();
    const [showMenu, setShowMenu] = useState(false);

    const btcAddress = accounts?.[0]?.address;
    const shortAddr = btcAddress
        ? `${btcAddress.slice(0, 8)}…${btcAddress.slice(-6)}`
        : "";

    return (
        <header className="header">
            <div className="header-inner">
                {/* Logo */}
                <button className="logo-btn" onClick={onHomeClick} id="logo-btn">
                    <span className="logo-icon">₿</span>
                    <span className="logo-text">
                        Bit<span className="logo-accent">Bond</span>
                    </span>
                </button>

                <nav className="nav">
                    <button className="nav-link" onClick={onHomeClick} id="nav-home">
                        Home
                    </button>
                    {isConnected && (
                        <button className="nav-link" onClick={onDashboardClick} id="nav-dashboard">
                            Dashboard
                        </button>
                    )}
                    {isConnected && (
                        <button className="btn btn-primary btn-sm" onClick={onCreateClick} id="nav-create">
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
                                    id={`connect-${connector.id}`}
                                    onClick={() => connect({ id: connector.id })}
                                >
                                    <span className="wallet-icon">🔗</span>
                                    Connect Xverse
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="wallet-connected">
                            <button
                                className="wallet-address-btn"
                                id="wallet-address-btn"
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
                                        id="disconnect-btn"
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
