import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { exportReportToPDF } from "@/lib/pdfExport";
import { format } from "date-fns";
import { Lightbulb, CheckCircle2, Clock, Users, Download } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { toast } from "sonner";

import { PageHeader, StatCard } from "@/components/Primitives";
import { Button } from "@/components/ui/button";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics · HUBFLOW" }] }),
  component: Reports,
});

const STATUS_COLORS: Record<string, string> = {
  Draft: "var(--color-chart-3)",
  InReview: "var(--color-chart-1)",
  Approved: "var(--color-chart-2)",
  Rejected: "var(--color-chart-5)",
  Archived: "var(--color-muted-foreground)",
};

function Reports() {
  const { ideas } = useData();

  const approvalRate = ideas.length
    ? Math.round((ideas.filter((i) => i.status === "Approved").length / ideas.length) * 100)
    : 0;

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach((i) => (counts[i.status] = (counts[i.status] ?? 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [ideas]);

  const monthlyData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach((i) => {
      const key = format(new Date(i.createdAt), "MMM yyyy");
      counts[key] = (counts[key] ?? 0) + 1;
    });
    const entries = Object.entries(counts).map(([month, count]) => ({ month, count }));
    return entries.sort((a, b) => +new Date(a.month) - +new Date(b.month));
  }, [ideas]);

  const trendData = useMemo(() => {
    let cumulative = 0;
    return monthlyData.map((d) => {
      cumulative += d.count;
      return { month: d.month, ideas: cumulative };
    });
  }, [monthlyData]);

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Track innovation momentum across your portfolio."
        action={
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => exportReportToPDF('meu-relatorio')}
          >
            <Download className="h-4 w-4" /> 
            Export PDF
          </Button>
        }
      />

      {/* Container principal adicionado aqui com o ID para exportação */}
      <div id="meu-relatorio">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Ideas" value={ideas.length} icon={Lightbulb} tone="blue" />
          <StatCard label="Approval Rate" value={`${approvalRate}%`} icon={CheckCircle2} tone="green" />
          <StatCard label="Avg Review Time (days)" value={7} icon={Clock} tone="amber" />
          <StatCard label="Active Contributors" value={new Set(ideas.map((i) => i.author)).size} icon={Users} tone="gray" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChartCard title="Ideas Trend Over Time" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="ideas" stroke="var(--color-chart-1)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Status Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "var(--color-chart-4)"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Ideas Submitted" className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  fontSize: 12,
};

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className ?? ""}`}>
      <h3 className="mb-4 font-bold">{title}</h3>
      {children}
    </div>
  );
}