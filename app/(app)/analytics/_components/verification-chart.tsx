"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function VerificationChart() {
  // Mock data for visualization
  const data = [
    { day: "Mon", verifications: 45 },
    { day: "Tue", verifications: 52 },
    { day: "Wed", verifications: 61 },
    { day: "Thu", verifications: 58 },
    { day: "Fri", verifications: 73 },
    { day: "Sat", verifications: 68 },
    { day: "Sun", verifications: 82 },
  ];

  const maxValue = Math.max(...data.map((d) => d.verifications));

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
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {data.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${(item.verifications / maxValue) * 100}%`,
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
              <div className="text-2xl font-bold">439</div>
              <div className="text-xs text-muted-foreground">Total This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">63</div>
              <div className="text-xs text-muted-foreground">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">+18%</div>
              <div className="text-xs text-muted-foreground">vs Last Week</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
