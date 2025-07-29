import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import {
	useSignAndExecuteTransaction,
	useSuiClient,
	useCurrentAccount,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { useState } from "react";

export function CreateCounter({
	onCreated,
}: {
	onCreated: (id: string) => void;
}) {
	const counterPackageId = useNetworkVariable("counterPackageId");
	const suiClient = useSuiClient();
	const currentAccount = useCurrentAccount();
	const [error, setError] = useState<string | null>(null);
	const [createdId, setCreatedId] = useState<string | null>(null);
	const [debugInfo, setDebugInfo] = useState<string | null>(null);

	const {
		mutate: signAndExecute,
		isPending,
	} = useSignAndExecuteTransaction();

	if (!currentAccount) {
		return (
			<Container>
				<div style={{ color: "red", marginBottom: "10px" }}>
					Please connect your wallet first.
				</div>
			</Container>
		);
	}

	async function create() {
		setError(null);
		setCreatedId(null);
		setDebugInfo(null);

		// Validate package ID
		if (!counterPackageId || counterPackageId.trim() === "") {
			setError("Counter package ID is not configured for this network.");
			return;
		}

		if (!counterPackageId.startsWith("0x") || counterPackageId.length !== 66) {
			setError(
				"Invalid package ID format. Should be a 66-character hex string starting with 0x"
			);
			return;
		}

		const tx = new Transaction();
		tx.moveCall({
			arguments: [],
			target: `${counterPackageId}::counter::create`,
		});

		signAndExecute(
			{ transaction: tx },
			{
				onSuccess: async ({ digest }) => {
					try {
						setDebugInfo(`Transaction digest: ${digest}`);
						
						const { effects, objectChanges } = await suiClient.waitForTransaction({
							digest,
							options: { 
								showEffects: true, 
								showObjectChanges: true 
							},
						});

						console.log("Transaction effects:", effects);
						console.log("Object changes:", objectChanges);

						// Try multiple ways to get the created object ID
						let createdObjectId: string | undefined;

						// Method 1: From effects.created
						if (effects?.created?.[0]?.reference?.objectId) {
							createdObjectId = effects.created[0].reference.objectId;
							setDebugInfo(prev => `${prev}\nFound object ID in effects.created: ${createdObjectId}`);
						}

						// Method 2: From objectChanges
						if (!createdObjectId && objectChanges) {
							const createdObject = objectChanges.find(
								(change) => change.type === "created"
							);
							if (createdObject && "objectId" in createdObject) {
								createdObjectId = createdObject.objectId;
								setDebugInfo(prev => `${prev}\nFound object ID in objectChanges: ${createdObjectId}`);
							}
						}

						// Method 3: From effects.mutated (in case it's not in created)
						if (!createdObjectId && effects?.mutated?.[0]?.reference?.objectId) {
							createdObjectId = effects.mutated[0].reference.objectId;
							setDebugInfo(prev => `${prev}\nFound object ID in effects.mutated: ${createdObjectId}`);
						}

						if (createdObjectId) {
							setCreatedId(createdObjectId);
							setDebugInfo(prev => `${prev}\nCalling onCreated with ID: ${createdObjectId}`);
							
							// Add a small delay to ensure state updates
							setTimeout(() => {
								onCreated(createdObjectId);
							}, 100);
						} else {
							setError("Transaction completed but no object ID could be found.");
							setDebugInfo(prev => `${prev}\nNo object ID found in transaction result`);
						}
					} catch (err) {
						console.error("Error fetching transaction result:", err);
						setError(`Failed to process transaction: ${err}`);
						setDebugInfo(`Error: ${err}`);
					}
				},
				onError: (err) => {
					console.error("Transaction error:", err);
					setError(`Transaction failed: ${err.message || err}`);
					setDebugInfo(`Transaction error: ${err.message || err}`);
				},
			}
		);
	}

	return (
		<Container>
			{error && (
				<div
					style={{
						color: "red",
						marginBottom: "10px",
						padding: "8px",
						border: "1px solid red",
						borderRadius: "4px",
						fontSize: "14px",
					}}
				>
					{error}
				</div>
			)}

			{debugInfo && (
				<div
					style={{
						color: "blue",
						marginBottom: "10px",
						padding: "8px",
						border: "1px solid blue",
						borderRadius: "4px",
						fontSize: "12px",
						fontFamily: "monospace",
						whiteSpace: "pre-wrap",
					}}
				>
					Debug Info: {debugInfo}
				</div>
			)}

			<Button size="3" onClick={create} disabled={isPending}>
				{isPending ? "Creating..." : "Create Counter"}
			</Button>

			{isPending && (
				<div
					style={{
						marginTop: "10px",
						fontSize: "14px",
						color: "#666",
					}}
				>
					Creating counter... Please wait.
				</div>
			)}

			{createdId && (
				<div
					style={{
						marginTop: "10px",
						fontSize: "14px",
						color: "green",
					}}
				>
					Counter created successfully! ID: {createdId}
				</div>
			)}
		</Container>
	);
}