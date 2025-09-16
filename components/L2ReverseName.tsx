"use client";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import { useEffect, useMemo, useState } from "react";

type Props = {
  reverseRegistrarAddress: `0x${string}`;
  address?: `0x${string}`;
};

const L2_REVERSE_REGISTRAR_ABI = [
  {
    type: "function",
    name: "nameForAddr",
    stateMutability: "view",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ name: "name", type: "string" }],
  },
] as const;

export default function L2ReverseRegistrarLookup({ reverseRegistrarAddress, address }: Props) {
  const acct = useAccount();
  const target = address ?? (acct.address as `0x${string}` | undefined);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!target) {
      setName(null);
      setError(null);
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const client = createPublicClient({ chain: base, transport: http() });
        const resolved = (await client.readContract({
          address: reverseRegistrarAddress,
          abi: L2_REVERSE_REGISTRAR_ABI,
          functionName: "nameForAddr",
          args: [target],
        })) as string;
        setName(resolved && resolved.length > 0 ? resolved : null);
      } catch (e) {
        setError(String(e instanceof Error ? e.message : e));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [reverseRegistrarAddress, target]);

  const display = useMemo(() => {
    if (!mounted) return "…";
    if (!target) return "Connect wallet";
    if (loading) return "Loading…";
    if (error) return `Error: ${error}`;
    return name ?? "No L2 reverse";
  }, [mounted, target, loading, error, name]);

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
        {display === "…" || display === "Connect wallet" || display === "Loading…" || display.startsWith("Error:") || display === "No L2 reverse" ? (
          <span style={{ color: "#97a3b6" }}>{display}</span>
        ) : (
          <span style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: 9999,
            background: "linear-gradient(90deg, rgba(0,82,255,0.2), rgba(0,231,255,0.15))",
            border: "1px solid rgba(0, 82, 255, 0.35)",
            color: "#e5f0ff",
            fontWeight: 600,
            letterSpacing: 0.2,
          }}>
            {display}
          </span>
        )}
      </p>
    </div>
  );
}


