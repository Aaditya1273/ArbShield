"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { CONTRACTS } from "@/lib/contracts";
import { parseAbiItem } from "viem";

interface DayData {
  day: string;
  verifications: number;
}

export function VerificationChart() {
  const publicClient = usePublicClient();
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationData = async () => {
      if (!publicClient) return;

      try {
        // Fetch all ProofVerified events
        const logs = await publicClient.getLogs({
          address: CONTRACTS.ZK_VERIFIER,
          event: parseAbiItem('event ProofVerified(address indexed user, string attributeType, bytes32 proofHash, uint256 gasUsed)'),
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Get timestamps for each event
        const eventsWithTime = await Promise.all(
          logs.map(async (log) => {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            return Number(block.timestamp);
          })
        );

        // Group by day of week
        const now = Date.now() / 1000;
        const sevenDaysAgo = now - 7 * 24 * 60 * 60;
        const recentEvents = eventsWithTime.filter((t) => t > sevenDaysAgo);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCount: Record<string, number> = {};

        recentEvents.forEach((timestamp) => {
          const date = new Date(timestamp * 1000);
          const dayName = dayNames[date.getDay()];
          dayCount[dayName] = (dayCount[dayName] || 0) + 1;
        });

        // Create data for last 7 days
        const chartData: DayData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const dayName = dayNames[date.getDay()];
          chartData.push({
            day: dayName,
            verifications: dayCount[dayName] || 0,
          });
        }

        setData(chartData);
      } catch (error) {
        console.error('Failed to fetch verification data:', error);
        // Fallback to empty data
        setData([
          { day: "Mon", verifications: 0 },
          { day: "Tue", verifications: 0 },
          { day: "Wed", verifications: 0 },
          { day: "Thu", verifications: 0 },
          { day: "Fri", verifications: 0 },
          { day: "Sat", verifications: 0 },
          { day: "Sun", verifications: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, [publicClient]);

  const maxValue = Math.max(...data.map((d) => d.verifications), 1);
  const totalThisWeek = data.reduce((sum, d) => sum + d.verifications, 0);
  const dailyAverage = totalThisWeek > 0 ? Math.round(totalThisWeek / 7) : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Verification Activity
          </CardTitle>
          <CardDescription>
            Daily verification count over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Verification Activity
        </CardTitle>
        <CardDescription>
          Daily verification count over the past week (real blockchain data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {data.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${maxValue > 0 ? (item.verifications / maxValue) * 100 : 0}%`,
                      minHeight: item.verifications > 0 ? '4px' : '0',
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{item.day}</div>
                <div className="text-xs font-medium">{item.verifications}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalThisWeek}</div>
              <div className="text-xs text-muted-foreground">Total This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dailyAverage}</div>
              <div className="text-xs text-muted-foreground">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Real Data</div>
              <div className="text-xs text-muted-foreground">From Blockchain</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
