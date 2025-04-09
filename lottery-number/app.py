import json
import random

# 1. Generate 10,000 unique 4-digit numbers (0000-9999)
numbers = [f"{i:04d}" for i in range(10000)]
random.shuffle(numbers)  # Randomize order

# 2. Assign tiers (adjust % as needed)
tier_allocation = {
    "Tier1": 70,  # 70% of tickets (7,000)
    "Tier2": 20,  # 20% of tickets (2,000)
    "Tier3": 10   # 10% of tickets (1,000)
}

# 3. Split numbers into tiers
tiers = {
    "Tier1": numbers[:7000],
    "Tier2": numbers[7000:9000],
    "Tier3": numbers[9000:]
}

# 4. Save to JSON
with open("lottery_numbers.json", "w") as f:
    json.dump(tiers, f)