import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import type { SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { useState } from "react";

export function Counter({ id }: { id: string }) {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
    id,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  const [waitingForTxn, setWaitingForTxn] = useState("");

  const executeMoveCall = async (method: "increment" | "decrement" | "reset") => {
    try {
      setWaitingForTxn(method);

      const tx = new Transaction();
      const counterObject = tx.object(id);

      if (method === "reset") {
        tx.moveCall({
          target: `${counterPackageId}::counter::reset`,
          arguments: [counterObject, tx.pure.u64(0)],
        });
      } else if (method === "increment") {
        tx.moveCall({
          target: `${counterPackageId}::counter::increment`,
          arguments: [counterObject],
        });
      } else {
        tx.moveCall({
          target: `${counterPackageId}::counter::decrement`,
          arguments: [counterObject],
        });
      }

      const txResult = await signAndExecute({ transaction: tx });
      await suiClient.waitForTransaction({ digest: txResult.digest });
      await refetch();
    } catch (e) {
      console.error("Transaction failed:", e);
    } finally {
      setWaitingForTxn("");
    }
  };

  if (isPending) return <Text>Loading counter data...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;
  if (!data.data) return <Text>Counter not found</Text>;

  const fields = getCounterFields(data.data);
  const isOwner = fields?.owner === currentAccount?.address;

  return (
    <>
      <Heading size="3">Counter ID: {id}</Heading>
      <Flex direction="column" gap="3" mt="3">
        <Text size="5">Count: {fields?.value ?? "N/A"}</Text>

        <Flex direction="row" gap="3">
          <Button onClick={() => executeMoveCall("increment")} disabled={waitingForTxn !== ""}>
            {waitingForTxn === "increment" ? "Increasing Counter..." : "Increment"}
          </Button>

          <Button onClick={() => executeMoveCall("decrement")} disabled={waitingForTxn !== ""}>
            {waitingForTxn === "decrement" ? "Decreasing Counter..." : "Decrement"}
          </Button>

          {isOwner && (
            <Button onClick={() => executeMoveCall("reset")} disabled={waitingForTxn !== ""}>
              {waitingForTxn === "reset" ? "Resetting Counter...": "Reset"}
            </Button>
          )}
        </Flex>
      </Flex>
    </>
  );
}

function getCounterFields(data: SuiObjectData) {
  if (data.content?.dataType !== "moveObject") return null;
  return data.content.fields as { value: number; owner: string };
}
