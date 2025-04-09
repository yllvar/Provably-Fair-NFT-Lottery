import json
import os

# Load tiered numbers
with open("lottery_numbers.json", "r") as f:
    tiers = json.load(f)

# Create metadata folder
os.makedirs("metadata", exist_ok=True)

# Template for all NFTs (same image, different attributes)
base_metadata = {
    "symbol": "LUCKY",
    "image": "ipfs://YOUR_PINATA_IMAGE_CID/ticket_image.png",  # Upload image first!
    "properties": {
        "files": [{"uri": "ticket_image.png", "type": "image/png"}]
    }
}

# Generate files
for tier, numbers in tiers.items():
    for num in numbers:
        metadata = base_metadata.copy()
        metadata["name"] = f"Lucky Ticket #{num} ({tier})"
        metadata["description"] = f"NFT Lottery Ticket - Number: {num} | Tier: {tier}"
        metadata["attributes"] = [
            {"trait_type": "Tier", "value": tier},
            {"trait_type": "Number", "value": num}
        ]
        
        with open(f"metadata/{num}.json", "w") as f:
            json.dump(metadata, f)