"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { createPublicClient, http, toCoinType } from "viem";
import { useEffect, useMemo, useState } from "react";
import L2ReverseName from "../components/L2ReverseName";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [ensip19Name, setEnsip19Name] = useState<string | null>(null);
  const [ensip19Error, setEnsip19Error] = useState<string | null>(null);
  useEffect(() => {
    if (!address) {
      setEnsip19Name(null);
      setEnsip19Error(null);
      return;
    }
    const client = createPublicClient({ chain: mainnet, transport: http() });
    client
      .getEnsName({
        address,
        coinType: toCoinType(base.id),
        // gatewayUrls: [
        //   "https://lb.drpc.org/gateway/unruggable?network=base",
        //   "https://base.3668.io",
        // ],
      })
      .then((name) => {
        setEnsip19Name(name ?? null);
        setEnsip19Error(null);
      })
      .catch((err) => setEnsip19Error(String(err)));
  }, [address]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const display = useMemo(() => {
    if (!mounted) return "…";
    if (!isConnected) return "Connect wallet";
    return ensip19Name ?? "No primary name";
  }, [mounted, isConnected, ensip19Name]);
  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <div className={styles.content}>
        <Image
          priority
          src="/sphere.svg"
          alt="Sphere"
          width={200}
          height={200}
        />
        <h1 className={styles.title}>OnchainKit</h1>

        <p suppressHydrationWarning>Primary name: {display}</p>
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

        <L2ReverseName reverseRegistrarAddress={"0x0000000000D8e504002cC26E3Ec46D81971C1664"} />

        <h2 className={styles.componentsTitle}>Explore Components</h2>

        <ul className={styles.components}>
          {[
            {
              name: "Transaction",
              url: "https://docs.base.org/onchainkit/transaction/transaction",
            },
            {
              name: "Swap",
              url: "https://docs.base.org/onchainkit/swap/swap",
            },
            {
              name: "Checkout",
              url: "https://docs.base.org/onchainkit/checkout/checkout",
            },
            {
              name: "Wallet",
              url: "https://docs.base.org/onchainkit/wallet/wallet",
            },
            {
              name: "Identity",
              url: "https://docs.base.org/onchainkit/identity/identity",
            },
          ].map((component) => (
            <li key={component.name}>
              <a target="_blank" rel="noreferrer" href={component.url}>
                {component.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// debug component removed for simplicity
