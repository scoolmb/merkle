import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { MerkleTree } from "merkletreejs";

// Define types
type ClaimEntry = {
  index: number,
  address: string,
  amount: number,
};

type ClaimList = ClaimEntry[];

// Hash a single claim entry
function hashClaimEntry(entry: ClaimEntry): Buffer {
  const data = `${entry.index}:${entry.address}:${entry.amount}`;
  return createHash("sha256").update(data).digest();
}

// Generate complete Merkle tree helper
const createMerkleTree = (
  claimList: { index: number, address: string, amount: number }[]
) => {
  const leaves = claimList.map((entry) => hashClaimEntry(entry));

  const merkleTree = new MerkleTree(
    leaves,
    (data: any) => createHash("sha256").update(data).digest(),
    { sortPairs: true }
  );

  return merkleTree;
};

// Get root as Uint8Array for on-chain use
function getMerkleRootArray(tree: MerkleTree): Uint8Array {
  return new Uint8Array(tree.getRoot());
}

// Helper to get proof for eligible wallets
const getMerkleProof = (
  merkleTree: MerkleTree,
  address: string,
  amount: number,
  index: number
): number[][] => {
  const leaf = hashClaimEntry({ index, address, amount });
  const proof = merkleTree.getProof(leaf);

  return proof.map((p) => Array.from(p.data));
};

// Main function to read CSV and generate Merkle tree
async function main() {
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, "wallets.csv");
    const csvData = fs.readFileSync(csvPath, "utf-8");

    // Parse CSV into ClaimEntry objects
    const claimList: ClaimList = [];
    const lines = csvData.split("\n").filter((line) => line.trim() !== "");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header row if exists
      if (i === 0 && (line.includes("address") || line.includes("amount")))
        continue;

      const [address, amountStr] = line.split(",").map((item) => item.trim());
      const amount = parseFloat(amountStr);

      if (!address || isNaN(amount)) {
        console.warn(`Skipping invalid line: ${line}`);
        continue;
      }

      claimList.push({
        index: claimList.length,
        address,
        amount,
      });
    }

    if (claimList.length === 0) {
      throw new Error("No valid entries found in wallets.csv");
    }

    // Generate Merkle tree
    const merkleTree = createMerkleTree(claimList);
    const root = merkleTree.getRoot().toString("hex");

    console.log("Merkle Root:", root);
    console.log("Tree:", merkleTree.toString());

    // Optionally save proofs for each address
    const proofs: Record<string, any> = {};

    for (const entry of claimList) {
      const proof = getMerkleProof(
        merkleTree,
        entry.address,
        entry.amount,
        entry.index
      );

      proofs[entry.address] = {
        index: entry.index,
        amount: entry.amount,
        proof: proof,
        proofHex: proof.map((p) => Buffer.from(p).toString("hex")),
      };
    }

    // Save results to a JSON file
    const output = {
      root,
      rootArray: Array.from(getMerkleRootArray(merkleTree)),
      totalEntries: claimList.length,
      proofs,
    };

    const outputPath = path.join(__dirname, "merkle-output.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`Results saved to ${outputPath}`);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
