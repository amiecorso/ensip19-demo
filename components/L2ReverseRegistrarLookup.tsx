"use client";
import { useMemo } from "react";

// Direct L2 reverse lookup display for Base. This is presentational;
// the parent performs the on-chain read and passes in the result.

type Props = {
  reverseRegistrarAddress: `0x${string}`;
  address?: `0x${string}`;
  loading?: boolean;
  error?: string | null;
  name?: string | null;
};

export default function L2ReverseRegistrarLookup({
  reverseRegistrarAddress,
  address,
  loading,
  error,
  name,
}: Props) {
  const display = useMemo(() => {
    if (!address) return "Connect wallet";
    if (loading) return "Loading…";
    if (error) return `Error: ${error}`;
    return name ?? "No L2 reverse";
  }, [address, loading, error, name]);

  const isPlaceholder =
    display === "Connect wallet" ||
    display === "Loading…" ||
    display === "No L2 reverse" ||
    display.startsWith("Error:");

  return (
    <div>
      <h3 style={{ marginBottom: 4 }}>Direct lookup in L2ReverseRegistrar (Base)</h3>
      <div style={{ marginBottom: 8 }}>
        <a
          href={`https://basescan.org/address/${reverseRegistrarAddress}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#60a5fa", textDecoration: "none" }}
        >
          View contract on Basescan
        </a>
      </div>
      <p suppressHydrationWarning>
        {isPlaceholder ? (
          <span style={{ color: "#97a3b6" }}>{display}</span>
        ) : (
          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: 9999,
              background:
                "linear-gradient(90deg, rgba(0,82,255,0.2), rgba(0,231,255,0.15))",
              border: "1px solid rgba(0, 82, 255, 0.35)",
              color: "#e5f0ff",
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            {display}
          </span>
        )}
      </p>
    </div>
  );
}
