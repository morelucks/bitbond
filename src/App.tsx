import { useState } from "react";
import { useAccounts } from "@midl/react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { Dashboard } from "./components/Dashboard";
import { CreateEscrowModal } from "./components/CreateEscrowModal";
import { EscrowDetail } from "./components/EscrowDetail";
import "./App.css";

type View = "home" | "dashboard" | "detail";

export default function App() {
  const { isConnected } = useAccounts();
  const [view, setView] = useState<View>("home");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEscrowId, setSelectedEscrowId] = useState<bigint | null>(null);

  const handleViewEscrow = (id: bigint) => {
    setSelectedEscrowId(id);
    setView("detail");
  };

  return (
    <div className="app">
      <Header
        onDashboardClick={() => setView(isConnected ? "dashboard" : "home")}
        onHomeClick={() => setView("home")}
        onCreateClick={() => setShowCreateModal(true)}
      />

      <main className="main-content">
        {view === "home" && (
          <HeroSection
            onGetStarted={() => {
              if (isConnected) setView("dashboard");
            }}
          />
        )}

        {view === "dashboard" && isConnected && (
          <Dashboard
            onViewEscrow={handleViewEscrow}
            onCreateEscrow={() => setShowCreateModal(true)}
          />
        )}

        {view === "detail" && selectedEscrowId !== null && (
          <EscrowDetail
            escrowId={selectedEscrowId}
            onBack={() => setView("dashboard")}
          />
        )}
      </main>

      {showCreateModal && (
        <CreateEscrowModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(id) => {
            setShowCreateModal(false);
            setSelectedEscrowId(id);
            setView("detail");
          }}
        />
      )}
    </div>
  );
}
