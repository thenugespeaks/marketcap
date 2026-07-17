"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
  ticker: string;
  initialWatched?: boolean;
}

export function WatchlistButton({ ticker, initialWatched = false }: WatchlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [watched, setWatched] = useState(initialWatched);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    try {
      if (watched) {
        await fetch("/api/watchlist", { method: "DELETE", body: JSON.stringify({ ticker }), headers: { "Content-Type": "application/json" } });
        setWatched(false);
      } else {
        await fetch("/api/watchlist", { method: "POST", body: JSON.stringify({ ticker }), headers: { "Content-Type": "application/json" } });
        setWatched(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
        watched
          ? "border-blue-500 bg-blue-500 text-white"
          : "border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-500 dark:border-gray-600 dark:bg-gray-800"
      }`}
    >
      {watched ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
    </button>
  );
}
