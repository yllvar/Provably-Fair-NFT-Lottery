interface Window {
  solana?: {
    isPhantom?: boolean
    connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
    disconnect: () => Promise<void>
    signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>
  }
  createSolanaPayRequest?: (tier: string) => void
}
