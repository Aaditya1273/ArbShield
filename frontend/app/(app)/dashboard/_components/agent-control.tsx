"use client";

import { Loader2, Play, Square } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAgentStatus } from "@/hooks/use-agent-data";

export function AgentControl() {
  const { data: status, refetch, isLoading: statusLoading } = useAgentStatus();
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const response = await fetch("/api/agents/start", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start agents");
      }

      const data = await response.json();
      toast.success("Agents started successfully", {
        description: data.message,
      });

      // Refresh status
      await refetch();
    } catch (error: any) {
      toast.error("Failed to start agents", {
        description: error.message,
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      const response = await fetch("/api/agents/stop", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to stop agents");
      }

      const data = await response.json();
      toast.success("Agents stopped successfully", {
        description: data.message,
      });

      // Refresh status
      await refetch();
    } catch (error: any) {
      toast.error("Failed to stop agents", {
        description: error.message,
      });
    } finally {
      setIsStopping(false);
    }
  };

  const isOnline = status?.status === "online";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Agent Status</CardTitle>
            <CardDescription>
              Control autonomous monitoring system
            </CardDescription>
          </div>
          <Badge variant={isOnline ? "default" : "secondary"} className="gap-2">
            <div
              className={`size-2 rounded-full ${
                isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Check Interval</p>
                <p className="font-medium">
                  {status?.checkIntervalHours || 2} hours
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cycles Completed</p>
                <p className="font-medium">{status?.cycleCount || 0}</p>
              </div>
            </div>

            {isOnline && status?.wallet && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="text-muted-foreground mb-1">Monitoring Wallet</p>
                <p className="font-mono text-xs">{status.wallet}</p>
              </div>
            )}

            <div className="flex gap-2">
              {!isOnline ? (
                <Button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="flex-1 gap-2"
                >
                  {isStarting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  Start Monitoring
                </Button>
              ) : (
                <Button
                  onClick={handleStop}
                  disabled={isStopping}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  {isStopping ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Square className="size-4" />
                  )}
                  Stop Monitoring
                </Button>
              )}
            </div>

            {!isOnline && (
              <p className="text-xs text-muted-foreground text-center">
                Start monitoring to activate autonomous liquidity management
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
