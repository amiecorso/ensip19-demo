"use client";
import styles from "./page.module.css";
import { Wallet, ConnectWallet, WalletDropdown } from "@coinbase/onchainkit/wallet";
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { createPublicClient, http, toCoinType } from "viem";
import { useEffect, useMemo, useState } from "react";
import L2ReverseRegistrarLookup from "../components/L2ReverseRegistrarLookup";

const L2_REVERSE_REGISTRAR_ABI = [
  {
    type: "function",
    name: "nameForAddr",
    stateMutability: "view",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ name: "name", type: "string" }],
  },
] as const;

const BASE_L2_REVERSE_REGISTRAR_ADDRESS = "0x0000000000D8e504002cC26E3Ec46D81971C1664" as const;

export default function Home() {
  // Require a robust mainnet RPC for ENSIP-19 CCIP reads to avoid default node limits
  if (!process.env.NEXT_PUBLIC_MAINNET_RPC_URL) {
    throw new Error("Missing NEXT_PUBLIC_MAINNET_RPC_URL. Set it in .env.local");
  }
  const { address, isConnected } = useAccount();
  const [ensip19Name, setEnsip19Name] = useState<string | null>(null);
  const [ensip19Error, setEnsip19Error] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [l2NameDirectLookup, setL2Name] = useState<string | null>(null);
  const [l2Loading, setL2Loading] = useState(false);
  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!address) {
      setEnsip19Name(null);
      setEnsip19Error(null);
      setL2Name(null);
      setLoading(false);
      setL2Loading(false);
      return;
    }
    const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL!;
    // ENSIP-19 resolution for base happens on mainnet using coinType for Base
    const mainnetClient = createPublicClient({ chain: mainnet, transport: http(mainnetRpcUrl) });
    const baseClient = createPublicClient({ chain: base, transport: http() });

    // Kick off both lookups in parallel so the L2 card can show regardless of ENSIP-19 result
    setLoading(true);
    setL2Loading(true);

    mainnetClient
      .getEnsName({ address, coinType: toCoinType(base.id) })
      .then((primaryNameViaEnsip19) => {
        setEnsip19Name(primaryNameViaEnsip19 ?? null);
        setEnsip19Error(null);
      })
      .catch((e) => setEnsip19Error(String(e instanceof Error ? e.message : e)))
      .finally(() => setLoading(false));

    baseClient
      .readContract({
        address: BASE_L2_REVERSE_REGISTRAR_ADDRESS,
        abi: L2_REVERSE_REGISTRAR_ABI,
        functionName: "nameForAddr",
        args: [address],
      })
      .then((primaryNameViaDirectLookup) => {
        const val = primaryNameViaDirectLookup as string;
        setL2Name(val && val.length > 0 ? val : null);
      })
      .catch(() => {})
      .finally(() => setL2Loading(false));
  }, [address]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const display = useMemo(() => {
    if (!mounted) return "…";
    if (!isConnected) return "Connect wallet";
    return ensip19Name ?? "No primary name found via ENSIP-19";
  }, [mounted, isConnected, ensip19Name]);
  if (!hydrated) return null;
  const displayIsPlaceholder = display === "…" || display === "Connect wallet" || display === "No primary name";
  // In the OCK connector, we'll override the display name to show the primary name found via ENSIP-19, or the direct lookup in the L2ReverseRegistrar
  const connectorName = ensip19Name ?? l2NameDirectLookup ?? undefined;
  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name name={connectorName} />
          </ConnectWallet>
          <WalletDropdown />
        </Wallet>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Primary Name resolution with ENSIP-19</h1>
        <div className={styles.address} suppressHydrationWarning>
          {address ? `Address: ${address}` : "Connect wallet to resolve"}
        </div>

        <div className={styles.sections}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>ENSIP-19 (via CCIP Read)</h3>
            <p suppressHydrationWarning>
              {loading ? (
                <span className={styles.loading}>
                  Loading
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </span>
              ) : displayIsPlaceholder ? (
                <span className={styles.placeholder}>{display}</span>
              ) : (
                <span className={styles.namePill}>{display}</span>
              )}
            </p>
            {ensip19Error ? (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer" }}>Resolution error (expand)</summary>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: "#0f172a",
                    color: "#fca5a5",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 12,
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                  {ensip19Error}
                </pre>
              </details>
            ) : null}
          </div>

          <div className={styles.card}>
            <L2ReverseRegistrarLookup
              reverseRegistrarAddress={BASE_L2_REVERSE_REGISTRAR_ADDRESS}
              address={address as `0x${string}` | undefined}
              loading={l2Loading}
              error={null}
              name={l2NameDirectLookup}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
