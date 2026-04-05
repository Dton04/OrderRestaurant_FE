export type LoyaltyRuleStatus = 'ACTIVE' | 'INACTIVE';
export type LoyaltyRewardStatus = 'ACTIVE' | 'INACTIVE';

export interface LoyaltyRule {
  id: string;
  name: string;
  pointsPerTransaction: number;
  minimumSpend: number;
  startDate: string;
  status: LoyaltyRuleStatus;
  updatedAt: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  voucherTemplate: string;
  pointsRequired: number;
  redemptionCount: number;
  status: LoyaltyRewardStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyHistoryItem {
  id: string;
  userName: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: string;
}

export interface LoyaltyDashboardResponse {
  rules: LoyaltyRule[];
  rewards: LoyaltyReward[];
  history: LoyaltyHistoryItem[];
}

export interface CreateLoyaltyRuleDto {
  name: string;
  pointsPerTransaction: number;
  minimumSpend: number;
  startDate: string;
}

export type UpdateLoyaltyRuleDto = Partial<CreateLoyaltyRuleDto> & {
  status?: LoyaltyRuleStatus;
};

export interface CreateLoyaltyRewardDto {
  name: string;
  description: string;
  voucherTemplate: string;
  pointsRequired: number;
}

export type UpdateLoyaltyRewardDto = Partial<CreateLoyaltyRewardDto> & {
  status?: LoyaltyRewardStatus;
};
