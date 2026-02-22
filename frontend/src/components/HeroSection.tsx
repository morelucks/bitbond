import { AddressPurpose } from "@midl/core";
import { useConnect, useAccounts } from "@midl/react";
import "./HeroSection.css";

interface HeroSectionProps {
    onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
    const { isConnected } = useAccounts();
    const { connectors, connect } = useConnect({ purposes: [AddressPurpose.Ordinals] });

    return (
        <section className="hero">
            {/* Animated background orbs */}
            <div className="hero-bg">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
                <div className="grid-overlay" />
            </div>

            <div className="hero-content">
                {/* Badge */}
                <div className="hero-badge" id="hero-badge">
                    <span className="badge-dot" />
                    Built on Midl · Powered by Bitcoin
                </div>

                {/* Title */}
                <h1 className="hero-title" id="hero-title">
                    Trustless Escrow for
                    <br />
                    <span className="hero-gradient">Bitcoin Freelancers</span>
                </h1>

                <p className="hero-subtitle">
                    Lock funds in a smart contract. Release only when the work is done.
                    <br />
                    <strong>No middleman. No custody risk. No ambiguity.</strong>
                </p>

                {/* CTA */}
                <div className="hero-cta" id="hero-cta">
                    {!isConnected ? (
                        <>
                            {connectors.map((c) => (
                                <button
                                    key={c.id}
                                    className="btn btn-hero-primary"
                                    id={`hero-connect-${c.id}`}
                                    onClick={() => connect({ id: c.id })}
                                >
                                    <span>🔗</span> Connect Xverse Wallet
                                </button>
                            ))}
                            <a
                                href="https://www.xverse.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-hero-secondary"
                                id="hero-get-xverse"
                            >
                                Get Xverse →
                            </a>
                        </>
                    ) : (
                        <button
                            className="btn btn-hero-primary"
                            id="hero-go-dashboard"
                            onClick={onGetStarted}
                        >
                            Open Dashboard →
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="hero-stats" id="hero-stats">
                    <div className="stat">
                        <span className="stat-value">100%</span>
                        <span className="stat-label">Non-Custodial</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Middlemen</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat">
                        <span className="stat-value">∞</span>
                        <span className="stat-label">Trust Guaranteed</span>
                    </div>
                </div>
            </div>

            {/* Feature cards */}
            <div className="feature-grid" id="feature-grid">
                {[
                    { icon: "🔗", title: "Xverse Wallet", desc: "Connect with the leading Bitcoin wallet. One click, full ownership." },
                    { icon: "🔒", title: "On-Chain Locking", desc: "Funds secured in a Solidity contract on Midl — no admin access." },
                    { icon: "✅", title: "Client Approval", desc: "Client releases funds only after confirming delivered work." },
                    { icon: "🧾", title: "TX Proof", desc: "Every action leaves an immutable, verifiable on-chain trail." },
                ].map((f) => (
                    <div className="feature-card" key={f.title}>
                        <span className="feature-icon">{f.icon}</span>
                        <h3 className="feature-title">{f.title}</h3>
                        <p className="feature-desc">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
