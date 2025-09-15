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

export default function L2ReverseName({ reverseRegistrarAddress, address }: Props) {
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
    <div style={{ width: "100%", maxWidth: 720, marginTop: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Direct L2 Reverse (Base)</h3>
      <p suppressHydrationWarning>{display}</p>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#0f172a",
          color: "#e2e8f0",
          padding: 12,
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        {JSON.stringify({ address: target ?? null, name, error }, null, 2)}
      </pre>
    </div>
  );
}


