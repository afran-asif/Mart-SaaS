"use client";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

export interface DailyPoint {
    date: string;
    label: string;
    revenue: number;
    orders: number;
}

interface DashboardChartsProps {
    dailySeries: DailyPoint[];
    statusBreakdown: Record<string, number>;
}

const STATUS_PIE_COLORS: Record<string, string> = {
    Pending: "#EAB308",
    Processing: "#3B82F6",
    Delivered: "#16A34A",
    Cancelled: "#EF4444",
};

const tk = (v: number | string) => `৳${Number(v).toLocaleString("en-IN")}`;

export default function DashboardCharts({ dailySeries, statusBreakdown }: DashboardChartsProps) {
    const { t } = useTranslation();
    const hasRevenue = dailySeries.some((d) => d.revenue > 0);
    const statusLabel = (name: string) =>
        name === "Pending" ? t("dashboard.statusPending")
        : name === "Processing" ? t("dashboard.statusProcessing")
        : name === "Delivered" ? t("dashboard.statusDelivered")
        : name === "Cancelled" ? t("dashboard.statusCancelled")
        : name;
    const pieData = ["Pending", "Processing", "Delivered", "Cancelled"]
        .map((name) => ({ key: name, name: statusLabel(name), value: statusBreakdown[name] || 0 }))
        .filter((d) => d.value > 0);
    const totalOrders = pieData.reduce((n, d) => n + d.value, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Revenue — last 14 days */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-gray-900">{t("dashboard.revenueTitle")}</h2>
                    <span className="text-[11px] font-semibold text-gray-400">
                        {t("dashboard.chartTotal")} {tk(dailySeries.reduce((n, d) => n + d.revenue, 0))}
                    </span>
                </div>
                {hasRevenue ? (
                    <div className="h-60 sm:h-72 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#16A34A" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#16A34A" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                                    tickLine={false}
                                    axisLine={{ stroke: "#e5e7eb" }}
                                    interval="preserveStartEnd"
                                    minTickGap={40}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                                    width={40}
                                />
                                <Tooltip
                                    formatter={(value) => [tk(Number(value)), t("dashboard.revenueLabel")]}
                                    labelFormatter={(label) => `${label}`}
                                    contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#16A34A"
                                    strokeWidth={2.5}
                                    fill="url(#revFill)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: "#16A34A" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 py-14 text-center">{t("dashboard.noRevenue")}</p>
                )}
            </div>

            {/* Orders by status — donut */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-1">{t("dashboard.ordersByStatus")}</h2>
                {pieData.length > 0 ? (
                    <div className="h-60 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="58%"
                                    outerRadius="85%"
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {pieData.map((d) => (
                                        <Cell key={d.key} fill={STATUS_PIE_COLORS[d.key]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value} orders`, ""]}
                                    contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <p className="text-center text-xs text-gray-500 -mt-1">{t("dashboard.chartTotal")} {totalOrders} {t("dashboard.ordersUnit")}</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 py-14 text-center">{t("dashboard.noChartOrders")}</p>
                )}
            </div>
        </div>
    );
}
