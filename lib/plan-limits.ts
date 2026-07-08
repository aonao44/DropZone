// プラン別の利用上限
// サーバー（API・Server Components）とクライアントの両方から参照する純粋な定数。
// 課金判定そのものは lib/billing.ts に集約されている。

export interface PlanLimits {
  maxProjects: number;
  maxFilesPerProject: number;
}

export const FREE_PLAN_LIMITS: PlanLimits = {
  maxProjects: 3,
  maxFilesPerProject: 10,
};

export const PREMIUM_PLAN_LIMITS: PlanLimits = {
  maxProjects: 20,
  maxFilesPerProject: 50,
};

export function getPlanLimits(hasPremiumAccess: boolean): PlanLimits {
  return hasPremiumAccess ? PREMIUM_PLAN_LIMITS : FREE_PLAN_LIMITS;
}
