import { AddressPurpose } from "@midl/core";
import { useConnect, useAccounts, useDisconnect } from "@midl/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import "./Header.css";

interface HeaderProps {
    onDashboardClick: () => void;
    onHomeClick: () => void;
    onCreateClick: () => void;
}

export function Header({ onDashboardClick, onHomeClick, onCreateClick }: HeaderProps) {
    const { accounts, isConnected } = useAccounts();
    const { connectors, connect, error, isPending } = useConnect({
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment]
    });
    const { disconnect } = useDisconnect();
    const [showMenu, setShowMenu] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log("🔍 Wallet Debug:", { 
            isConnected, 
            accountsCount: accounts?.length || 0,
            firstAccount: accounts?.[0],
            hasAddress: !!accounts?.[0]?.address
        });
    }, [isConnected, accounts]);

    const btcAddress = accounts?.[0]?.address || "";
    const hasWallet = isConnected && btcAddress;
    const shortAddr = btcAddress
        ? `${btcAddress.slice(0, 6)}...${btcAddress.slice(-4)}`
        : "";

    const handleConnect = async (connectorId: string) => {
        try {
            console.log("Connecting to ID:", connectorId);
            console.log("Available connectors:", connectors);
            
            // Check if Xverse is installed
            if (typeof window !== 'undefined' && !(window as any).XverseProviders) {
                toast.error("Xverse Wallet Not Found", {
                    description: "Please install Xverse wallet extension first.",
                    action: {
                        label: "Install",
                        onClick: () => window.open("https://www.xverse.app/download", "_blank")
                    }
                });
                return;
            }
            
            const result = await connect({ 
                id: connectorId
            });
            
            console.log("Connection result:", result);
            
            // Wait a bit for accounts to populate
            setTimeout(() => {
                console.log("Accounts after connection:", accounts);
            }, 1000);
            
            toast.success("Wallet Connected!");
        } catch (err: any) {
            console.error("Connect error:", err);
            if (err.message?.includes("AddressNetworkMismatch")) {
                toast.error("Network Mismatch", {
                    description: "Please switch your Xverse wallet to Testnet."
                });
            } else if (err.message?.includes("User rejected")) {
                toast.error("Connection Rejected", {
                    description: "You rejected the connection request."
                });
            } else {
                toast.error("Failed to connect wallet", { 
                    description: err.message || "Unknown error occurred" 
                });
            }
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
                    {!hasWallet ? (
                        <div className="connectors">
                            {isPending ? (
                                <button className="btn btn-wallet" disabled>
                                    <span className="wallet-icon">⏳</span>
                                    Connecting...
                                </button>
                            ) : connectors.length > 0 ? (
                                connectors.map((connector) => (
                                    <button
                                        key={connector.id}
                                        className="btn btn-wallet"
                                        onClick={() => handleConnect(connector.id)}
                                    >
                                        <span className="wallet-icon">🔗</span>
                                        Connect {(connector as any).name || "Xverse"}
                                    </button>
                                ))
                            ) : (
                                <button
                                    className="btn btn-wallet"
                                    onClick={() => window.open("https://www.xverse.app/download", "_blank")}
                                >
                                    <span className="wallet-icon">⚠️</span>
                                    Install Xverse Wallet
                                </button>
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
