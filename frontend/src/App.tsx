import { useState } from "react";
import { useAccounts } from "@midl/react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { DashboardDemo } from "./components/DashboardDemo";
import { CreateEscrowModalDemo } from "./components/CreateEscrowModalDemo";
import { EscrowDetailDemo } from "./components/EscrowDetailDemo";
import "./App.css";

type View = "home" | "dashboard" | "detail";

export default function App() {
  const { isConnected } = useAccounts();
  const [view, setView] = useState<View>("home");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEscrowId, setSelectedEscrowId] = useState<number | null>(null);

  const handleViewEscrow = (id: number) => {
    setSelectedEscrowId(id);
    setView("detail");
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setView("dashboard");
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
          <DashboardDemo onViewEscrow={handleViewEscrow} />
        )}

        {view === "detail" && selectedEscrowId !== null && (
          <EscrowDetailDemo
            escrowId={selectedEscrowId}
            onBack={() => setView("dashboard")}
          />
        )}
      </main>

      {showCreateModal && (
        <CreateEscrowModalDemo
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
