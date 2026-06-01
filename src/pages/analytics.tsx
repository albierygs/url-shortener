import Footer from "@/components/footer";
import Header from "@/components/header";
import MainPage from "@/components/main-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Activity,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MousePointerClick,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from "recharts";

interface Log {
  id: number;
  date: string;
  ip: string;
  userAgent: string;
  device: string;
}

interface AnalyticsData {
  originalLink: string;
  shortId: string;
  summary: { totalAccesses: number; peakAccesses: number; average: number };
  lineChartData: { time: string; accesses: number }[];
  deviceTypeData: { name: string; value: number }[];
  hourlyAccessesToday: { hour: string; accesses: number }[];
  recentLogs: {
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
    logs: Log[];
  };
}

const chartConfigPie = {
  desktop: { label: "Desktop", color: "var(--color-chart-1)" },
  mobile: { label: "Mobile", color: "var(--color-chart-2)" },
  tablet: { label: "Tablet", color: "var(--color-chart-3)" },
  bot: { label: "Bot", color: "var(--color-chart-4)" }
};

const chartConfigLine = {
  accesses: { label: "Acessos", color: "var(--color-chart-1)" }
};

const chartConfigBar = {
  accesses: { label: "Acessos por hora", color: "var(--color-chart-1)" }
};

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d" | "all">("7d");

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [logs, setLogs] = useState<Log[]>([]);
  const [hasMoreLogs, setHasMoreLogs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Analytics do Link | UrlShortener";
  });

  const fetchAnalytics = useCallback(
    async (isLoadMore = false) => {
      if (!id) return;
      try {
        if (!isLoadMore) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await fetch(
          `/api/${id}/analytics?period=${period}&page=${isLoadMore ? page : 1}&pageSize=${pageSize}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            navigate("/not-found", { replace: true });
            return;
          }
          throw new Error("Erro ao buscar dados de analytics");
        }

        const result: AnalyticsData = await response.json();
        setData(result);

        if (isLoadMore) {
          setLogs((prev) => [...prev, ...result.recentLogs.logs]);
        } else {
          setLogs(result.recentLogs.logs);
        }

        setHasMoreLogs(result.recentLogs.pagination.page < result.recentLogs.pagination.totalPages);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [id, period, page, pageSize, navigate]
  );

  useEffect(() => {
    setPage(1); // Reset page when period changes
    fetchAnalytics(false);
  }, [period, id]);

  const handleLoadMore = () => {
    setPage((prev) => {
      const nextPage = prev + 1;
      return nextPage;
    });
  };

  useEffect(() => {
    if (page > 1) {
      fetchAnalytics(true);
    }
  }, [page]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !data) {
    return (
      <MainPage header={<Header />} footer={<Footer />}>
        <div className="flex justify-center items-center h-64 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainPage>
    );
  }

  if (error || !data) {
    return (
      <MainPage header={<Header />} footer={<Footer />}>
        <div className="flex justify-center items-center h-64 w-full text-destructive">
          <p>{error || "Falha ao carregar dados."}</p>
        </div>
      </MainPage>
    );
  }

  const { originalLink, summary, lineChartData, deviceTypeData, hourlyAccessesToday } = data;

  const formattedPieData = deviceTypeData.map((d) => {
    const nameLower = d.name.toLowerCase();
    return {
      ...d,
      configName: nameLower,
      fill: `var(--color-${nameLower})`
    };
  });

  const formattedLineChartData = lineChartData.map((d) => {
    const date = new Date(d.time);
    let formattedTime = d.time;

    if (period === "24h") {
      const now = new Date();
      const isYesterday = date.getUTCDate() !== now.getUTCDate();
      const hourStr = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
      });
      formattedTime = isYesterday ? `Ontem, ${hourStr}` : hourStr;
    } else if (period === "all") {
      formattedTime = date.toLocaleDateString([], {
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
      });
    } else {
      formattedTime = date.toLocaleDateString([], {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
      });
    }

    return { ...d, formattedTime };
  });

  return (
    <MainPage header={<Header />} footer={<Footer />}>
      <div className="space-y-8 w-full pb-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics do Link</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Original:</span>
              <a
                href={originalLink}
                target="_blank"
                rel="noreferrer"
                className="truncate max-w-[200px] sm:max-w-[300px] text-foreground hover:underline flex items-center gap-1 font-medium"
                title={originalLink}
              >
                <span className="truncate">{originalLink}</span>{" "}
                <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Curto:</span>
              <div className="flex items-center gap-2 border border-border/50 rounded-md px-2.5 py-1 bg-muted/30">
                <span className="text-foreground font-medium">
                  {window.location.host}/{id}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Copiar link"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
            <SelectTrigger className="w-[180px]" disabled={loading}>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="all">Todo o tempo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalAccesses}</div>
              <p className="text-xs text-muted-foreground">No período selecionado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pico de Acessos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.peakAccesses}</div>
              <p className="text-xs text-muted-foreground">Maior acesso no período</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Acessos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(summary.average * 10) / 10}</div>
              <p className="text-xs text-muted-foreground">
                Média por {period === "24h" ? "hora" : period === "all" ? "mês" : "dia"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Acessos ao longo do tempo</CardTitle>
              <CardDescription>Visualização agrupada pelo período selecionado</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {formattedLineChartData.length > 0 ? (
                <ChartContainer config={chartConfigLine} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formattedLineChartData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="formattedTime"
                        className="text-xs"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="accesses"
                        stroke="var(--color-accesses)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "var(--color-accesses)" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispositivos</CardTitle>
              <CardDescription>Percentual de tipos de dispositivos</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center pb-0">
              {formattedPieData.length > 0 ? (
                <ChartContainer config={chartConfigPie} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={formattedPieData}
                        dataKey="value"
                        nameKey="configName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      />
                      <ChartLegend
                        content={<ChartLegendContent className="-translate-y-2 flex-wrap gap-2" />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Acessos por hora (Hoje)</CardTitle>
            <CardDescription>Distribuição dos acessos nas últimas 24h</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {hourlyAccessesToday.length > 0 ? (
              <ChartContainer config={chartConfigBar} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyAccessesToday}
                    margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      vertical={false}
                    />
                    <XAxis dataKey="hour" className="text-xs" tickLine={false} axisLine={false} />
                    <YAxis className="text-xs" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="accesses" fill="var(--color-accesses)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Acessos</CardTitle>
            <CardDescription>Registro detalhado das visitas ao link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data / Hora</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Dispositivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const formattedDate = new Date(log.date).toLocaleString();
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {formattedDate}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                        <TableCell
                          className="truncate max-w-[150px] sm:max-w-[300px]"
                          title={log.userAgent}
                        >
                          {log.userAgent}
                        </TableCell>
                        <TableCell className="capitalize">{log.device}</TableCell>
                      </TableRow>
                    );
                  })}
                  {logs.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum acesso registrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {hasMoreLogs && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Carregar mais
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainPage>
  );
};

export default Analytics;
