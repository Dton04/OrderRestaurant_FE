import api from './auth';
import type {
  CreateLoyaltyRewardDto,
  CreateLoyaltyRuleDto,
  LoyaltyDashboardResponse,
  LoyaltyReward,
  LoyaltyRule,
  UpdateLoyaltyRewardDto,
  UpdateLoyaltyRuleDto,
} from '../types/loyalty';

export const loyaltyApi = {
  getDashboard: async (): Promise<LoyaltyDashboardResponse> => {
    const response = await api.get<LoyaltyDashboardResponse>('/loyalty/dashboard');
    return response.data;
  },
  createRule: async (data: CreateLoyaltyRuleDto): Promise<LoyaltyRule> => {
    const response = await api.post<LoyaltyRule>('/loyalty/rules', data);
    return response.data;
  },
  updateRule: async (
    id: string,
    data: UpdateLoyaltyRuleDto,
  ): Promise<LoyaltyRule> => {
    const response = await api.patch<LoyaltyRule>(`/loyalty/rules/${id}`, data);
    return response.data;
  },
  deactivateRule: async (id: string): Promise<LoyaltyRule> => {
    const response = await api.patch<LoyaltyRule>(
      `/loyalty/rules/${id}/deactivate`,
    );
    return response.data;
  },
  createReward: async (
    data: CreateLoyaltyRewardDto,
  ): Promise<LoyaltyReward> => {
    const response = await api.post<LoyaltyReward>('/loyalty/rewards', data);
    return response.data;
  },
  updateReward: async (
    id: string,
    data: UpdateLoyaltyRewardDto,
  ): Promise<LoyaltyReward> => {
    const response = await api.patch<LoyaltyReward>(
      `/loyalty/rewards/${id}`,
      data,
    );
    return response.data;
  },
  deleteReward: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(
      `/loyalty/rewards/${id}`,
    );
    return response.data;
  },
};

export default loyaltyApi;
