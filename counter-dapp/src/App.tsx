import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { Box, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Counter } from "./Counter";
import { CreateCounter } from "./components/CreateCounter";

function App() {
	const currentAccount = useCurrentAccount();
	const [counterId, setCounterId] = useState<string | null>(null);

	// On initial load, check hash for a counter ID
	useEffect(() => {
		const hash = window.location.hash.slice(1);
		if (isValidSuiObjectId(hash)) {
			setCounterId(hash);
		}
	}, []);

	// Set new counter ID and update hash when created
	const handleCreated = (id: string) => {
		setCounterId(id);
		window.location.hash = id;
	};

	return (
		<>
			<Flex
				position="sticky"
				px="4"
				py="3"
				justify="between"
				style={{
					borderBottom: "1px solid var(--gray-a3)",
					background: "var(--gray-a1)",
					zIndex: 10,
					top: 0,
				}}
			>
				<Box>
					<Heading size="4">My Counter App</Heading>
				</Box>

				<Box>
					<ConnectButton />
				</Box>
			</Flex>

			<Container size="3" mt="5">
				<Box
					p="4"
					style={{
						background: "var(--gray-a2)",
						borderRadius: "8px",
						minHeight: "400px",
					}}
				>
					{currentAccount ? (
						counterId ? (
							<Counter id={counterId} />
						) : (
							<CreateCounter onCreated={handleCreated} />
						)
					) : (
						<Text size="4" weight="medium">
							Please connect your wallet to get started.
						</Text>
					)}
				</Box>
			</Container>
		</>
	);
}

export default App;
