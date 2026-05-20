"use client";

import { useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type AnalyticsData = {
  overview: Record<string, number>;
  productivity: Record<string, number>;
  series: { label: string; value: number }[];
  recent_activity: {
    top_note_categories: string[];
    memory_count: number;
    recent_notification_titles: string[];
  };
};

export default function AnalyticsClient() {
  const [userId] = useState("demo-user");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch(`${apiBaseUrl}/analytics?user_id=${encodeURIComponent(userId)}`);
        if (!response.ok) {
          return;
        }
        const data: AnalyticsData = await response.json();
        setAnalytics(data);
      } catch {
        setAnalytics(null);
      }
    }

    void loadAnalytics();
  }, [userId]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {analytics ? Object.entries(analytics.overview).map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-lg shadow-black/10">
            <p className="text-sm text-neutral-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        )) : (
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-neutral-400 md:col-span-3 xl:col-span-5">
            No analytics available yet.
          </div>
        )}
      </section>

      {analytics ? (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">Workspace activity</h2>
            <p className="mt-2 text-sm text-neutral-400">Relative counts across your ASTRA surfaces.</p>
            <div className="mt-6 space-y-4">
              {analytics.series.map((item) => {
                const maxValue = Math.max(...analytics.series.map((seriesItem) => seriesItem.value), 1);
                const widthPercentage = Math.max((item.value / maxValue) * 100, 8);
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300 capitalize">{item.label}</span>
                      <span className="text-neutral-500">{item.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-white via-neutral-300 to-emerald-300"
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {Object.entries(analytics.productivity).map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">{label.split("_").join(" ")}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <div className="mt-5 space-y-4 text-sm text-neutral-300">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Note categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analytics.recent_activity.top_note_categories.length ? analytics.recent_activity.top_note_categories.map((category) => (
                    <span key={category} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-300">
                      {category}
                    </span>
                  )) : (
                    <p>None yet</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Memory count</p>
                <p className="mt-2 text-2xl font-semibold text-white">{analytics.recent_activity.memory_count}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Notifications</p>
                <ul className="mt-2 space-y-2">
                  {analytics.recent_activity.recent_notification_titles.map((title) => (
                    <li key={title} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{title}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
