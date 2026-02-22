// Mock contract address for demo (no real deployment needed)
export const MOCK_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

// Mock escrow data structure
export interface MockEscrow {
  id: number;
  client: string;
  freelancer: string;
  amount: string;
  description: string;
  deadline: number;
  status: number; // 0=Active, 1=Completed, 2=Disputed, 3=Refunded
  createdAt: number;
}

// LocalStorage keys
const ESCROWS_KEY = "bitbond_escrows";
const NEXT_ID_KEY = "bitbond_next_id";

// Mock contract functions
export const mockContract = {
  // Create new escrow
  createEscrow: (
    freelancer: string,
    amount: string,
    description: string,
    deadline: number,
    client: string
  ): MockEscrow => {
    const escrows = getEscrows();
    const nextId = getNextId();

    const newEscrow: MockEscrow = {
      id: nextId,
      client,
      freelancer,
      amount,
      description,
      deadline,
      status: 0,
      createdAt: Date.now(),
    };

    escrows.push(newEscrow);
    saveEscrows(escrows);
    setNextId(nextId + 1);

    return newEscrow;
  },

  // Get all escrows
  getAllEscrows: (): MockEscrow[] => {
    return getEscrows();
  },

  // Get escrow by ID
  getEscrow: (id: number): MockEscrow | undefined => {
    const escrows = getEscrows();
    return escrows.find((e) => e.id === id);
  },

  // Release funds
  releaseFunds: (id: number): void => {
    const escrows = getEscrows();
    const escrow = escrows.find((e) => e.id === id);
    if (escrow && escrow.status === 0) {
      escrow.status = 1; // Completed
      saveEscrows(escrows);
    }
  },

  // Raise dispute
  raiseDispute: (id: number): void => {
    const escrows = getEscrows();
    const escrow = escrows.find((e) => e.id === id);
    if (escrow && escrow.status === 0) {
      escrow.status = 2; // Disputed
      saveEscrows(escrows);
    }
  },

  // Refund after deadline
  refundAfterDeadline: (id: number): void => {
    const escrows = getEscrows();
    const escrow = escrows.find((e) => e.id === id);
    if (escrow && escrow.status === 0 && Date.now() > escrow.deadline) {
      escrow.status = 3; // Refunded
      saveEscrows(escrows);
    }
  },

  // Clear all data (for testing)
  clearAll: (): void => {
    localStorage.removeItem(ESCROWS_KEY);
    localStorage.removeItem(NEXT_ID_KEY);
  },
};

// Helper functions
function getEscrows(): MockEscrow[] {
  const data = localStorage.getItem(ESCROWS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveEscrows(escrows: MockEscrow[]): void {
  localStorage.setItem(ESCROWS_KEY, JSON.stringify(escrows));
}

function getNextId(): number {
  const id = localStorage.getItem(NEXT_ID_KEY);
  return id ? parseInt(id) : 1;
}

function setNextId(id: number): void {
  localStorage.setItem(NEXT_ID_KEY, id.toString());
}
