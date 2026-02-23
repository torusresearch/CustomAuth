import { createPublicClient, createWalletClient, type Hex, http, type PublicClient, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

export const createViemClients = (privKey: Hex): { walletClient: WalletClient; publicClient: PublicClient } => {
  const account = privateKeyToAccount(privKey);
  const walletClient = createWalletClient({
    account,
    chain: polygon,
    transport: http("https://polygon-rpc.com"),
  });
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http("https://polygon-rpc.com"),
  });
  return { walletClient, publicClient };
};

export const signEthMessage = async (walletClient: WalletClient): Promise<string> => {
  const message = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
  const signature = await walletClient.signMessage({
    account: walletClient.account!,
    message: { raw: message as Hex },
  });
  return signature;
};
