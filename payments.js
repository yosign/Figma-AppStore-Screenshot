var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PAYMENT_PLANS = {
    MONTHLY: {
        id: 'monthly_subscription',
        price: 4.99,
        period: '月'
    },
    YEARLY: {
        id: 'yearly_subscription',
        price: 49.99,
        period: '年'
    }
};
// 免费使用次数限制
const FREE_USAGE_LIMIT = 3;
// 存储键名
const STORAGE_KEYS = {
    USAGE_COUNT: 'screenshot_usage_count',
    SUBSCRIPTION_STATUS: 'subscription_status'
};
// 检查用户的使用权限
export function checkUsagePermission() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 获取当前使用次数
            const usageCount = (yield figma.clientStorage.getAsync(STORAGE_KEYS.USAGE_COUNT)) || 0;
            // 检查订阅状态
            const subscriptionStatus = yield figma.clientStorage.getAsync(STORAGE_KEYS.SUBSCRIPTION_STATUS);
            // 如果有有效订阅，直接允许使用
            if (subscriptionStatus && subscriptionStatus.isActive) {
                return {
                    canUse: true,
                    message: '订阅有效'
                };
            }
            // 检查免费使用次数
            if (usageCount < FREE_USAGE_LIMIT) {
                return {
                    canUse: true,
                    message: `免费使用次数还剩 ${FREE_USAGE_LIMIT - usageCount} 次`
                };
            }
            // 超出免费使用次数限制
            return {
                canUse: false,
                message: '已超出免费使用次数限制，请订阅以继续使用'
            };
        }
        catch (error) {
            console.error('检查使用权限时出错:', error);
            return {
                canUse: false,
                message: '检查使用权限时出错'
            };
        }
    });
}
// 记录使用次数
export function recordUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentCount = (yield figma.clientStorage.getAsync(STORAGE_KEYS.USAGE_COUNT)) || 0;
            yield figma.clientStorage.setAsync(STORAGE_KEYS.USAGE_COUNT, currentCount + 1);
        }
        catch (error) {
            console.error('记录使用次数时出错:', error);
        }
    });
}
// 处理订阅
export function handleSubscription(planType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const plan = PAYMENT_PLANS[planType];
            if (!figma.payments) {
                console.error('Payments API not available');
                return false;
            }
            // 调用 Figma 的支付 API
            const result = yield figma.payments.initiate({
                productId: plan.id,
                title: `Super Screenshot ${plan.period}度订阅`,
                description: `订阅 Super Screenshot ${plan.period}度使用权限`,
                priceUsd: plan.price
            });
            if (result.status === 'COMPLETED') {
                // 更新订阅状态
                yield figma.clientStorage.setAsync(STORAGE_KEYS.SUBSCRIPTION_STATUS, {
                    isActive: true,
                    planType,
                    purchaseDate: new Date().toISOString(),
                    transactionId: result.transactionId
                });
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('处理订阅时出错:', error);
            return false;
        }
    });
}
// 重置使用次数（仅用于测试）
export function resetUsageCount() {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.clientStorage.setAsync(STORAGE_KEYS.USAGE_COUNT, 0);
    });
}
