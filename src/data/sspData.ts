export type RepData = {
  id: string;
  name: string;
  territory: string;
  historical6Mo: {
    conversations: number;
    discoveryScheduled: number;
    discoveryAttended: number;
    proposalAttended: number;
    newSales: number;
    salesAmount: number;
  };
  goals90Day: {
    monthly: {
      august: {
        conversations: number;
        discoveryScheduled: number;
        discoveryAttended: number;
        proposalAttended: number;
        newSales: number;
        salesAmount: number;
      },
      september: {
        conversations: number;
        discoveryScheduled: number;
        discoveryAttended: number;
        proposalAttended: number;
        newSales: number;
        salesAmount: number;
      },
      october: {
        conversations: number;
        discoveryScheduled: number;
        discoveryAttended: number;
        proposalAttended: number;
        newSales: number;
        salesAmount: number;
      }
    };
    weeklyTargets: {
      conversations: number;
      discoveryScheduled: number;
      discoveryAttended: number;
      proposalAttended: number;
      newSales: number;
      salesAmount: number;
    }
  };
  weeklyActuals: {
    week1: { conversations: number, discoveryScheduled: number, discoveryAttended: number, proposalAttended: number, newSales: number, salesAmount: number };
    week2: { conversations: number, discoveryScheduled: number, discoveryAttended: number, proposalAttended: number, newSales: number, salesAmount: number };
    week3: { conversations: number, discoveryScheduled: number, discoveryAttended: number, proposalAttended: number, newSales: number, salesAmount: number };
    week4: { conversations: number, discoveryScheduled: number, discoveryAttended: number, proposalAttended: number, newSales: number, salesAmount: number };
  }
};

const avgRev = 18000; // $18k ACV modeled for mid-market Provider

export const sspData: RepData[] = [
  {
    id: "r_1",
    name: "AE 1 - Top Performer",
    territory: "US East - Retail",
    historical6Mo: { conversations: 420, discoveryScheduled: 151, discoveryAttended: 132, proposalAttended: 95, newSales: 34, salesAmount: 34 * avgRev },
    goals90Day: {
      monthly: {
        august: { conversations: 75, discoveryScheduled: 29, discoveryAttended: 26, proposalAttended: 20, newSales: 8, salesAmount: 8 * avgRev },
        september: { conversations: 75, discoveryScheduled: 29, discoveryAttended: 26, proposalAttended: 20, newSales: 8, salesAmount: 8 * avgRev },
        october: { conversations: 75, discoveryScheduled: 29, discoveryAttended: 26, proposalAttended: 20, newSales: 8, salesAmount: 8 * avgRev }
      },
      weeklyTargets: { conversations: 19, discoveryScheduled: 7, discoveryAttended: 6, proposalAttended: 5, newSales: 2, salesAmount: 2 * avgRev }
    },
    weeklyActuals: {
      week1: { conversations: 20, discoveryScheduled: 8, discoveryAttended: 7, proposalAttended: 5, newSales: 2, salesAmount: 2 * avgRev },
      week2: { conversations: 18, discoveryScheduled: 7, discoveryAttended: 6, proposalAttended: 4, newSales: 1, salesAmount: 1 * avgRev },
      week3: { conversations: 22, discoveryScheduled: 9, discoveryAttended: 8, proposalAttended: 6, newSales: 3, salesAmount: 3 * avgRev },
      week4: { conversations: 19, discoveryScheduled: 7, discoveryAttended: 6, proposalAttended: 5, newSales: 2, salesAmount: 2 * avgRev },
    }
  },
  {
    id: "r_2",
    name: "AE 2 - Consistent",
    territory: "US West - Tech",
    historical6Mo: { conversations: 380, discoveryScheduled: 114, discoveryAttended: 98, proposalAttended: 68, newSales: 22, salesAmount: 22 * avgRev },
    goals90Day: {
      monthly: {
        august: { conversations: 65, discoveryScheduled: 22, discoveryAttended: 19, proposalAttended: 14, newSales: 5, salesAmount: 5 * avgRev },
        september: { conversations: 65, discoveryScheduled: 22, discoveryAttended: 19, proposalAttended: 14, newSales: 5, salesAmount: 5 * avgRev },
        october: { conversations: 65, discoveryScheduled: 22, discoveryAttended: 19, proposalAttended: 14, newSales: 5, salesAmount: 5 * avgRev }
      },
      weeklyTargets: { conversations: 16, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev }
    },
    weeklyActuals: {
      week1: { conversations: 16, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
      week2: { conversations: 15, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 2, newSales: 1, salesAmount: 1 * avgRev },
      week3: { conversations: 17, discoveryScheduled: 6, discoveryAttended: 5, proposalAttended: 4, newSales: 2, salesAmount: 2 * avgRev },
      week4: { conversations: 16, discoveryScheduled: 4, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
    }
  },
  {
    id: "r_3",
    name: "AE 3 - Needs Coaching",
    territory: "US Central - Food & Bev",
    historical6Mo: { conversations: 450, discoveryScheduled: 90, discoveryAttended: 60, proposalAttended: 35, newSales: 10, salesAmount: 10 * avgRev }, // High activity, poor conversion
    goals90Day: {
      monthly: {
        august: { conversations: 70, discoveryScheduled: 20, discoveryAttended: 15, proposalAttended: 10, newSales: 3, salesAmount: 3 * avgRev },
        september: { conversations: 70, discoveryScheduled: 22, discoveryAttended: 17, proposalAttended: 12, newSales: 4, salesAmount: 4 * avgRev },
        october: { conversations: 70, discoveryScheduled: 25, discoveryAttended: 20, proposalAttended: 15, newSales: 5, salesAmount: 5 * avgRev }
      },
      weeklyTargets: { conversations: 17, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 2, newSales: 1, salesAmount: 1 * avgRev }
    },
    weeklyActuals: {
      week1: { conversations: 25, discoveryScheduled: 4, discoveryAttended: 2, proposalAttended: 1, newSales: 0, salesAmount: 0 },
      week2: { conversations: 22, discoveryScheduled: 3, discoveryAttended: 2, proposalAttended: 1, newSales: 0, salesAmount: 0 },
      week3: { conversations: 24, discoveryScheduled: 5, discoveryAttended: 3, proposalAttended: 2, newSales: 1, salesAmount: 1 * avgRev },
      week4: { conversations: 20, discoveryScheduled: 4, discoveryAttended: 2, proposalAttended: 1, newSales: 0, salesAmount: 0 },
    }
  },
  {
    id: "r_4",
    name: "AE 4 - Closer",
    territory: "US East - Healthcare",
    historical6Mo: { conversations: 280, discoveryScheduled: 98, discoveryAttended: 88, proposalAttended: 70, newSales: 28, salesAmount: 28 * avgRev }, // Low activity, high close
    goals90Day: {
      monthly: {
        august: { conversations: 50, discoveryScheduled: 18, discoveryAttended: 16, proposalAttended: 14, newSales: 6, salesAmount: 6 * avgRev },
        september: { conversations: 55, discoveryScheduled: 20, discoveryAttended: 18, proposalAttended: 15, newSales: 6, salesAmount: 6 * avgRev },
        october: { conversations: 60, discoveryScheduled: 22, discoveryAttended: 20, proposalAttended: 16, newSales: 7, salesAmount: 7 * avgRev }
      },
      weeklyTargets: { conversations: 12, discoveryScheduled: 4, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev }
    },
    weeklyActuals: {
      week1: { conversations: 10, discoveryScheduled: 4, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
      week2: { conversations: 12, discoveryScheduled: 5, discoveryAttended: 5, proposalAttended: 4, newSales: 2, salesAmount: 2 * avgRev },
      week3: { conversations: 9, discoveryScheduled: 3, discoveryAttended: 3, proposalAttended: 2, newSales: 1, salesAmount: 1 * avgRev },
      week4: { conversations: 11, discoveryScheduled: 4, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
    }
  },
  {
    id: "r_5",
    name: "AE 5 - Ramping",
    territory: "US South - Logistics",
    historical6Mo: { conversations: 150, discoveryScheduled: 30, discoveryAttended: 25, proposalAttended: 15, newSales: 4, salesAmount: 4 * avgRev },
    goals90Day: {
      monthly: {
        august: { conversations: 40, discoveryScheduled: 10, discoveryAttended: 8, proposalAttended: 5, newSales: 1, salesAmount: 1 * avgRev },
        september: { conversations: 50, discoveryScheduled: 15, discoveryAttended: 12, proposalAttended: 8, newSales: 2, salesAmount: 2 * avgRev },
        october: { conversations: 60, discoveryScheduled: 20, discoveryAttended: 17, proposalAttended: 12, newSales: 3, salesAmount: 3 * avgRev }
      },
      weeklyTargets: { conversations: 10, discoveryScheduled: 2, discoveryAttended: 2, proposalAttended: 1, newSales: 0, salesAmount: 0 }
    },
    weeklyActuals: {
      week1: { conversations: 12, discoveryScheduled: 3, discoveryAttended: 2, proposalAttended: 1, newSales: 0, salesAmount: 0 },
      week2: { conversations: 14, discoveryScheduled: 4, discoveryAttended: 3, proposalAttended: 2, newSales: 1, salesAmount: 1 * avgRev },
      week3: { conversations: 10, discoveryScheduled: 2, discoveryAttended: 2, proposalAttended: 1, newSales: 0, salesAmount: 0 },
      week4: { conversations: 15, discoveryScheduled: 4, discoveryAttended: 3, proposalAttended: 2, newSales: 0, salesAmount: 0 },
    }
  },
  {
    id: "r_6",
    name: "AE 6 - Steady",
    territory: "US West - FinServ",
    historical6Mo: { conversations: 350, discoveryScheduled: 105, discoveryAttended: 85, proposalAttended: 60, newSales: 18, salesAmount: 18 * avgRev },
    goals90Day: {
      monthly: {
        august: { conversations: 60, discoveryScheduled: 20, discoveryAttended: 16, proposalAttended: 12, newSales: 4, salesAmount: 4 * avgRev },
        september: { conversations: 60, discoveryScheduled: 20, discoveryAttended: 16, proposalAttended: 12, newSales: 4, salesAmount: 4 * avgRev },
        october: { conversations: 60, discoveryScheduled: 20, discoveryAttended: 16, proposalAttended: 12, newSales: 4, salesAmount: 4 * avgRev }
      },
      weeklyTargets: { conversations: 15, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev }
    },
    weeklyActuals: {
      week1: { conversations: 14, discoveryScheduled: 4, discoveryAttended: 3, proposalAttended: 2, newSales: 0, salesAmount: 0 },
      week2: { conversations: 16, discoveryScheduled: 6, discoveryAttended: 5, proposalAttended: 4, newSales: 2, salesAmount: 2 * avgRev },
      week3: { conversations: 15, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
      week4: { conversations: 15, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
    }
  },
  {
    id: "r_7",
    name: "AE 7 - New Hire",
    territory: "Canada - Mixed",
    historical6Mo: { conversations: 50, discoveryScheduled: 10, discoveryAttended: 8, proposalAttended: 4, newSales: 1, salesAmount: 1 * avgRev },
    goals90Day: {
      monthly: {
        august: { conversations: 30, discoveryScheduled: 6, discoveryAttended: 5, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
        september: { conversations: 40, discoveryScheduled: 10, discoveryAttended: 8, proposalAttended: 5, newSales: 1, salesAmount: 1 * avgRev },
        october: { conversations: 50, discoveryScheduled: 15, discoveryAttended: 12, proposalAttended: 8, newSales: 2, salesAmount: 2 * avgRev }
      },
      weeklyTargets: { conversations: 7, discoveryScheduled: 1, discoveryAttended: 1, proposalAttended: 0, newSales: 0, salesAmount: 0 }
    },
    weeklyActuals: {
      week1: { conversations: 8, discoveryScheduled: 2, discoveryAttended: 2, proposalAttended: 1, newSales: 0, salesAmount: 0 },
      week2: { conversations: 10, discoveryScheduled: 2, discoveryAttended: 1, proposalAttended: 0, newSales: 0, salesAmount: 0 },
      week3: { conversations: 9, discoveryScheduled: 3, discoveryAttended: 2, proposalAttended: 1, newSales: 1, salesAmount: 1 * avgRev },
      week4: { conversations: 11, discoveryScheduled: 3, discoveryAttended: 3, proposalAttended: 2, newSales: 0, salesAmount: 0 },
    }
  },
  {
    id: "r_8",
    name: "AE 8 - Consistent",
    territory: "US East - Tech",
    historical6Mo: { conversations: 390, discoveryScheduled: 117, discoveryAttended: 100, proposalAttended: 72, newSales: 24, salesAmount: 24 * avgRev },
    goals90Day: {
      monthly: {
        august: { conversations: 65, discoveryScheduled: 22, discoveryAttended: 19, proposalAttended: 14, newSales: 5, salesAmount: 5 * avgRev },
        september: { conversations: 65, discoveryScheduled: 22, discoveryAttended: 19, proposalAttended: 14, newSales: 5, salesAmount: 5 * avgRev },
        october: { conversations: 65, discoveryScheduled: 22, discoveryAttended: 19, proposalAttended: 14, newSales: 5, salesAmount: 5 * avgRev }
      },
      weeklyTargets: { conversations: 16, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev }
    },
    weeklyActuals: {
      week1: { conversations: 17, discoveryScheduled: 6, discoveryAttended: 5, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
      week2: { conversations: 15, discoveryScheduled: 4, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
      week3: { conversations: 18, discoveryScheduled: 7, discoveryAttended: 6, proposalAttended: 4, newSales: 2, salesAmount: 2 * avgRev },
      week4: { conversations: 16, discoveryScheduled: 5, discoveryAttended: 4, proposalAttended: 3, newSales: 1, salesAmount: 1 * avgRev },
    }
  }
];
