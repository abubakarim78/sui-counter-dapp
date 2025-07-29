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
        counterPackageId: "0xdd9639a4f13d28f9aa7f02b84354858e432af350bee02e080ec8f65ef56c0670",
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