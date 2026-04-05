import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock3,
  Gift,
  History,
  Loader2,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
  TicketPercent,
  Trash2,
} from 'lucide-react';
import loyaltyApi from '../../api/loyalty';
import type {
  CreateLoyaltyRewardDto,
  CreateLoyaltyRuleDto,
  LoyaltyHistoryItem,
  LoyaltyReward,
  LoyaltyRule,
} from '../../types/loyalty';

type RewardFormState = CreateLoyaltyRewardDto;
type RuleFormState = CreateLoyaltyRuleDto;

const emptyRewardForm: RewardFormState = {
  name: '',
  description: '',
  voucherTemplate: '',
  pointsRequired: 0,
};

const emptyRuleForm: RuleFormState = {
  name: '',
  pointsPerTransaction: 0,
  minimumSpend: 0,
  startDate: '',
};

const shortDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const numberFormat = (value: number) => new Intl.NumberFormat('en-US').format(value);

const statusClasses = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
};

const LoyaltyManagementPage: React.FC = () => {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [history, setHistory] = useState<LoyaltyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formState, setFormState] = useState<RewardFormState>(emptyRewardForm);
  const [ruleFormState, setRuleFormState] = useState<RuleFormState>(emptyRuleForm);

  const loadDashboard = async () => {
    const response = await loyaltyApi.getDashboard();
    setRules(response.rules);
    setRewards(response.rewards);
    setHistory(response.history);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await loadDashboard();
      } catch (error) {
        console.error('Failed to load loyalty dashboard:', error);
        setFeedback('Không thể tải dữ liệu loyalty từ API.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const filteredRewards = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rewards;
    return rewards.filter(
      (reward) =>
        reward.name.toLowerCase().includes(keyword) ||
        reward.voucherTemplate.toLowerCase().includes(keyword),
    );
  }, [rewards, search]);

  const totalRedemptions = history.length;
  const activeRules = rules.filter((rule) => rule.status === 'ACTIVE').length;
  const activeRewards = rewards.filter((reward) => reward.status === 'ACTIVE').length;

  const resetForm = () => {
    setFormState(emptyRewardForm);
    setEditingRewardId(null);
  };

  const resetRuleForm = () => {
    setRuleFormState(emptyRuleForm);
    setEditingRuleId(null);
  };

  const handleEditReward = (reward: LoyaltyReward) => {
    setEditingRewardId(reward.id);
    setFormState({
      name: reward.name,
      description: reward.description,
      voucherTemplate: reward.voucherTemplate,
      pointsRequired: reward.pointsRequired,
    });
  };

  const handleEditRule = (rule: LoyaltyRule) => {
    setEditingRuleId(rule.id);
    setRuleFormState({
      name: rule.name,
      pointsPerTransaction: rule.pointsPerTransaction,
      minimumSpend: rule.minimumSpend,
      startDate: rule.startDate.slice(0, 10),
    });
  };

  const handleSubmitRule = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setFeedback(null);

      if (editingRuleId) {
        await loyaltyApi.updateRule(editingRuleId, ruleFormState);
        setFeedback('Rule đã được cập nhật.');
      } else {
        await loyaltyApi.createRule(ruleFormState);
        setFeedback('Rule mới đã được tạo.');
      }

      await loadDashboard();
      resetRuleForm();
    } catch (error) {
      console.error('Failed to save rule:', error);
      setFeedback('Không thể lưu rule loyalty.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReward = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setFeedback(null);

      if (editingRewardId) {
        await loyaltyApi.updateReward(editingRewardId, formState);
        setFeedback('Reward đã được cập nhật.');
      } else {
        await loyaltyApi.createReward(formState);
        setFeedback('Reward mới đã được tạo.');
      }

      await loadDashboard();
      resetForm();
    } catch (error) {
      console.error('Failed to save reward:', error);
      setFeedback('Không thể lưu reward. Kiểm tra lại API loyalty.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    try {
      setSubmitting(true);
      setFeedback(null);
      await loyaltyApi.deleteReward(id);
      await loadDashboard();
      if (editingRewardId === id) {
        resetForm();
      }
      setFeedback('Reward đã được xóa.');
    } catch (error) {
      console.error('Failed to delete reward:', error);
      setFeedback('Không thể xóa reward.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateRule = async (id: string) => {
    try {
      setSubmitting(true);
      setFeedback(null);
      await loyaltyApi.deactivateRule(id);
      await loadDashboard();
      setFeedback('Rule đã được chuyển sang trạng thái inactive.');
    } catch (error) {
      console.error('Failed to deactivate rule:', error);
      setFeedback('Không thể deactivate rule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d76839]">
            Admin Loyalty Console
          </p>
          <h2 className="mt-2 text-[32px] font-black tracking-tight text-[#1f2022]">
            Loyalty Points & Redemption
          </h2>
          <p className="mt-2 text-sm font-medium text-[#7d7065]">
            Quản lý rule tích điểm, reward đổi thưởng và lịch sử redemption trong cùng một màn hình.
          </p>
        </div>

        <label className="relative block min-w-[280px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ab9b8d]"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reward or voucher template..."
            className="w-full rounded-2xl border border-[#efe3d7] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#1b1c1e] outline-none transition-all focus:border-[#d76839] focus:ring-4 focus:ring-[#d76839]/10"
          />
        </label>
      </div>

      {feedback ? (
        <div className="rounded-2xl bg-[#fff4ed] px-4 py-3 text-sm font-semibold text-[#a6401d]">
          {feedback}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[32px] bg-white">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto animate-spin text-[#d76839]" />
            <p className="mt-4 text-sm font-bold text-[#7d7065]">Đang tải loyalty data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] bg-gradient-to-br from-[#d76839] to-[#a6401d] p-5 text-white shadow-[0_20px_36px_rgba(187,88,46,0.22)]">
              <ShieldCheck size={22} className="text-white/80" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Active Rules
              </p>
              <p className="mt-2 text-4xl font-black">{numberFormat(activeRules)}</p>
            </div>
            <div className="rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
              <Gift size={22} className="text-[#d76839]" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#aa9c90]">
                Active Rewards
              </p>
              <p className="mt-2 text-4xl font-black text-[#1f2022]">{numberFormat(activeRewards)}</p>
            </div>
            <div className="rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
              <History size={22} className="text-[#d76839]" />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#aa9c90]">
                Redemption History
              </p>
              <p className="mt-2 text-4xl font-black text-[#1f2022]">{numberFormat(totalRedemptions)}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-6">
              <section className="rounded-[32px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#1f2022]">Point Rules</h3>
                  <TicketPercent size={18} className="text-[#d76839]" />
                </div>
                <div className="mt-5 space-y-4">
                  {rules.map((rule) => (
                    <article
                      key={rule.id}
                      className="rounded-[24px] border border-[#f1e4d8] bg-[#fffaf6] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-[#1f2022]">{rule.name}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#aa9c90]">
                            Start {shortDate(rule.startDate)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusClasses[rule.status]}`}
                        >
                          {rule.status}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#aa9c90]">
                            Points / Txn
                          </p>
                          <p className="mt-2 text-xl font-black text-[#1f2022]">
                            {rule.pointsPerTransaction}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#aa9c90]">
                            Min Spend
                          </p>
                          <p className="mt-2 text-xl font-black text-[#1f2022]">
                            ${numberFormat(rule.minimumSpend)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="flex-1 rounded-2xl border border-[#eadfd4] px-3 py-3 text-sm font-black text-[#7d7065]"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Pencil size={16} />
                            Edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeactivateRule(rule.id)}
                          disabled={submitting || rule.status === 'INACTIVE'}
                          className="flex-1 rounded-2xl bg-[#1f2022] px-3 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Power size={16} />
                            Deactivate
                          </span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <form onSubmit={handleSubmitRule} className="mt-6 space-y-4 rounded-[24px] bg-[#faf5ef] p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#1f2022]">
                      {editingRuleId ? 'Editing Rule' : 'Create Rule'}
                    </h4>
                    <button
                      type="button"
                      onClick={resetRuleForm}
                      className="text-xs font-black uppercase tracking-[0.18em] text-[#a69080]"
                    >
                      Reset
                    </button>
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                      Rule Name
                    </label>
                    <input
                      value={ruleFormState.name}
                      onChange={(event) =>
                        setRuleFormState((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-[#eadfd4] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                        Points / Txn
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ruleFormState.pointsPerTransaction}
                        onChange={(event) =>
                          setRuleFormState((current) => ({
                            ...current,
                            pointsPerTransaction: Number(event.target.value),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#eadfd4] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                        Min Spend
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={ruleFormState.minimumSpend}
                        onChange={(event) =>
                          setRuleFormState((current) => ({
                            ...current,
                            minimumSpend: Number(event.target.value),
                          }))
                        }
                        className="w-full rounded-2xl border border-[#eadfd4] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={ruleFormState.startDate}
                      onChange={(event) =>
                        setRuleFormState((current) => ({
                          ...current,
                          startDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-[#eadfd4] bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-[#1f2022] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editingRuleId ? 'Update Rule' : 'Add Rule'}
                  </button>
                </form>
              </section>

              <section className="rounded-[32px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#1f2022]">
                    {editingRewardId ? 'Edit Reward' : 'Create Reward'}
                  </h3>
                  <Plus size={18} className="text-[#d76839]" />
                </div>

                <form onSubmit={handleSubmitReward} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                      Reward Name
                    </label>
                    <input
                      value={formState.name}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, name: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#eadfd4] bg-[#fffaf6] px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                      Description
                    </label>
                    <textarea
                      value={formState.description}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full rounded-2xl border border-[#eadfd4] bg-[#fffaf6] px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                      Voucher Template
                    </label>
                    <input
                      value={formState.voucherTemplate}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          voucherTemplate: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-[#eadfd4] bg-[#fffaf6] px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                      Required Points
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.pointsRequired}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          pointsRequired: Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-[#eadfd4] bg-[#fffaf6] px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-2xl bg-[#d76839] px-4 py-3 text-sm font-black text-white shadow-[0_16px_28px_rgba(215,104,57,0.20)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Saving...' : editingRewardId ? 'Update Reward' : 'Add Reward'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-2xl border border-[#eadfd4] px-4 py-3 text-sm font-black text-[#7d7065]"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[32px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#1f2022]">Redeemable Items</h3>
                  <Gift size={18} className="text-[#d76839]" />
                </div>
                <div className="mt-5 space-y-4">
                  {filteredRewards.map((reward) => (
                    <article
                      key={reward.id}
                      className="rounded-[24px] border border-[#f1e4d8] bg-[#fffdfa] p-4 shadow-[0_8px_24px_rgba(85,54,33,0.04)]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-black text-[#1f2022]">{reward.name}</p>
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusClasses[reward.status]}`}
                            >
                              {reward.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium text-[#7d7065]">
                            {reward.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.16em] text-[#aa9c90]">
                            <span>{reward.voucherTemplate}</span>
                            <span>{reward.redemptionCount} redeemed</span>
                            <span>{reward.pointsRequired} pts</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReward(reward)}
                            className="rounded-2xl border border-[#eadfd4] px-4 py-3 text-sm font-black text-[#7d7065]"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Pencil size={16} />
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteReward(reward.id)}
                            disabled={submitting}
                            className="rounded-2xl bg-[#1f2022] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Trash2 size={16} />
                              Delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-[#1f2022]">Redemption History</h3>
                  <Clock3 size={18} className="text-[#d76839]" />
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                        <th className="px-3">User</th>
                        <th className="px-3">Reward</th>
                        <th className="px-3">Points</th>
                        <th className="px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr
                          key={item.id}
                          className="rounded-2xl bg-[#fffaf6] text-sm font-semibold text-[#1f2022]"
                        >
                          <td className="rounded-l-2xl px-3 py-4">{item.userName}</td>
                          <td className="px-3 py-4">{item.rewardName}</td>
                          <td className="px-3 py-4 text-[#d76839]">{item.pointsSpent} pts</td>
                          <td className="rounded-r-2xl px-3 py-4 text-[#7d7065]">
                            {shortDate(item.redeemedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoyaltyManagementPage;
