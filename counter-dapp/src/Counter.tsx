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
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { data, isPending, error, refetch } = useSuiClientQuery("getObject", {
  	id,
  	options: {
  		showContent: true,
  		showOwner: true,
  	},
  });

  const [waitingForTxn, setWaitingForTxn] = useState("");

  const executeMoveCall = (method: "increment" | "decrement" | "reset") => {
  	setWaitingForTxn(method);

  	const tx = new Transaction();

  	if (method === "reset") {
  		tx.moveCall({
  			arguments: [tx.object(id), tx.pure.u64(0)],
  			target: `${counterPackageId}::counter::reset`,
  		});
  	} else if (method === "increment") {
  		tx.moveCall({
  			arguments: [tx.object(id)],
  			target: `${counterPackageId}::counter::increment`,
  		});
  	} else {
      tx.moveCall({
  			arguments: [tx.object(id)],
  			target: `${counterPackageId}::counter::decrement`,
  		});
    }

  	signAndExecute(
  		{
  			transaction: tx,
  		},
  		{
  			onSuccess: (tx) => {
  				suiClient.waitForTransaction({ digest: tx.digest }).then(async () => {
  					await refetch();
  					setWaitingForTxn("");
  				});
  			},
  		},
  	);
  };

  if (isPending) return <Text>Loading...</Text>;

  if (error) return <Text>Error: {error.message}</Text>;

  if (!data.data) return <Text>Not found</Text>;

  const ownedByCurrentAccount =
  	getCounterFields(data.data)?.owner === currentAccount?.address;

  return (
  	<>
  		<Heading size="3">Counter {id}</Heading>

  		<Flex direction="column" gap="2">
  			<Text>Count: {getCounterFields(data.data)?.value}</Text>
  			<Flex direction="row" gap="2">
  				<Button
  					onClick={() => executeMoveCall("increment")}
  					disabled={waitingForTxn !== ""}
  				>
  					{waitingForTxn === "increment" ? "Increasing Count" : "Increment"}
  				</Button>
  				<Button
  					onClick={() => executeMoveCall("decrement")}
  					disabled={waitingForTxn !== ""}
  				>
  					{waitingForTxn === "decrement" ? "Decreasing Count" : "Decrement"}
  				</Button>
  				{ownedByCurrentAccount ? (
  					<Button
  						onClick={() => executeMoveCall("reset")}
  						disabled={waitingForTxn !== ""}
  					>
  						{waitingForTxn === "reset" ? "Resetting Count" : "Reset"}
  					</Button>
  				) : null}
  			</Flex>
  		</Flex>
  	</>
  );
}
function getCounterFields(data: SuiObjectData) {
  if (data.content?.dataType !== "moveObject") {
  	return null;
  }

  return data.content.fields as { value: number; owner: string };
}