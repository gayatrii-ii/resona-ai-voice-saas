"use client";

import { useState } from "react";
import { Pause, Play, Download, Redo, Undo } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useWaveSurfer } from "../hooks/use-wavesurfer";

type VoicePreviewPanelVoice = {
  id?: string;
  name: string;
};

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function VoicePreviewPanel({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewPanelVoice | null;
  text: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;

  const {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    togglePlayPause,
    seekBackward,
    seekForward,
  } = useWaveSurfer({
    url: audioUrl,
    autoplay: true,
  });

  const handleDownload = () => {
    setIsDownloading(true);

    const safeName =
      text
        .slice(0, 50)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "speech";

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${safeName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col justify-between border-t hidden lg:flex p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Voice preview</h3>
        {/* Time display */}
        <div className="text-sm font-medium tabular-nums tracking-tight text-foreground">
          {formatTime(currentTime)}&nbsp;
          <span className="text-muted-foreground">
            /&nbsp;{formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Waveform Content */}
      <div className="relative my-auto flex w-full items-center justify-center py-2">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Badge
              variant="outline"
              className="gap-2 bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm"
            >
              <Spinner className="size-3.5" />
              <span>Loading audio...</span>
            </Badge>
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            "w-full cursor-pointer transition-opacity duration-200",
            !isReady && "opacity-0",
          )}
        />
      </div>

      {/* Footer Controls */}
      <div className="grid w-full grid-cols-3 items-center pt-2">
        {/* Metadata */}
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-xs font-medium text-foreground">
            {text}
          </p>
          {selectedVoiceName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <VoiceAvatar
                seed={selectedVoiceSeed ?? selectedVoiceName}
                name={selectedVoiceName}
                className="size-4 shrink-0"
              />
              <span className="truncate">{selectedVoiceName}</span>
            </div>
          )}
        </div>

        {/* Player controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 flex-col"
            onClick={() => seekBackward(10)}
            disabled={!isReady}
          >
            <Undo className="size-3.5 -mb-0.5" />
            <span className="text-[9px] font-medium">10</span>
          </Button>

          <Button
            variant="default"
            size="icon"
            className="size-9 rounded-full"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="size-4 fill-background" />
            ) : (
              <Play className="size-4 fill-background" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 flex-col"
            onClick={() => seekForward(10)}
            disabled={!isReady}
          >
            <Redo className="size-3.5 -mb-0.5" />
            <span className="text-[9px] font-medium">10</span>
          </Button>
        </div>

        {/* Download */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

