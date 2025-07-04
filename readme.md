Merkle Tree Generator by Dropsy
Overview
A lightweight TypeScript tool for generating Merkle trees from wallet distribution lists. Processes CSV files and outputs complete Merkle proofs for blockchain applications.

📦 Prerequisites
Node.js v16+

TypeScript 4.7+

npm/yarn

🛠 Installation
bash
git clone https://github.com/your-repo/merkle-tree-generator.git
cd merkle-tree-generator
npm install
📂 File Structure
text
/
├── generate-merkle.ts # Main generator script
├── wallets.csv # Input template
├── merkle-output.json # Generated output
├── package.json # Dependencies
├── tsconfig.json # TypeScript config
└── README.md # This file
🚀 Usage

1. Prepare Input
   Create wallets.csv in project root:

csv
address,amount
0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B,100
0x4dDC2D193948926D02f9B1fE9e1daa0718270ED5,250
0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,500 2. Generate Tree
bash
npx ts-node generate-merkle.ts 3. Output Format
Results save to merkle-output.json:

json
{
"root": "5d7a9b...",
"rootArray": [93,122,155...],
"totalEntries": 3,
"proofs": {
"0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B": {
"index": 0,
"amount": 100,
"proof": [[189,45...],[...]],
"proofHex": ["bd2d...", ...]
}
}
}
🔧 Technical Details
Hashing Algorithm
typescript
function hashClaimEntry(entry: ClaimEntry): Buffer {
const data = `${entry.index}:${entry.address}:${entry.amount}`;
return createHash("sha256").update(data).digest();
}
Tree Configuration
Hash function: SHA-256

Leaf format: index:address:amount

Pair sorting: Enabled

📚 API Reference
Function Parameters Returns Description
createMerkleTree ClaimEntry[] MerkleTree Generates complete tree
getMerkleProof tree, address, amount, index number[][] Gets proof for specific wallet
getMerkleRootArray MerkleTree Uint8Array Gets root as byte array
🤝 Contributing
Fork the repository

Create feature branch (git checkout -b feature/fooBar)

Commit changes (git commit -am 'Add some fooBar')

Push to branch (git push origin feature/fooBar)

Open Pull Request

⚖️ License
MIT © Dropsy

This version:

Uses pure Markdown syntax

Maintains all visual formatting

Includes code blocks and tables

Has clear section headers

Provides complete documentation

Let me know if you'd like any adjustments to the structure or content.
