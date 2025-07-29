import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    localnet: {
      url: getFullnodeUrl("localnet"),
      variables: {
        counterPackageId: "counter-localnet",
      },
    },
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        counterPackageId: "counter-devnet",
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        // Replace with actual testnet package ID when deployed
        counterPackageId: "0xd02169b249fefd7dc89c8cd3ad2666ef085163cb99fae199a0f08d795712af9f",
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        // Replace with actual mainnet package ID when deployed
        counterPackageId: "", // Leave empty if not deployed to mainnet yet
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };