/**
 * Convert IPFS URI to HTTP URL for easier access
 * @param ipfsUri IPFS URI (ipfs://...)
 * @returns HTTP URL for the IPFS content
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri) return ""

  // Handle ipfs:// protocol
  if (ipfsUri.startsWith("ipfs://")) {
    // Replace ipfs:// with IPFS gateway URL
    // You can use Pinata's gateway or other public gateways
    return ipfsUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
  }

  // Handle CID directly
  if (ipfsUri.match(/^[a-zA-Z0-9]{46}/) || ipfsUri.match(/^Qm[a-zA-Z0-9]{44}/)) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUri}`
  }

  // Return as is if it's already an HTTP URL
  return ipfsUri
}

/**
 * Get metadata URL for a ticket number
 * @param metadataCid The CID of the metadata folder
 * @param ticketNumber The ticket number
 * @returns The HTTP URL for the metadata
 */
export function getMetadataUrl(metadataCid: string, ticketNumber: string): string {
  return ipfsToHttp(`ipfs://${metadataCid}/${ticketNumber}.json`)
}

/**
 * Get image URL from metadata
 * @param metadata The NFT metadata object
 * @returns The HTTP URL for the image
 */
export function getImageUrlFromMetadata(metadata: any): string {
  if (!metadata || !metadata.image) return ""
  return ipfsToHttp(metadata.image)
}
