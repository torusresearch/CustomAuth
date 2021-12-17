import { CustomChainConfig, EthereumPrivateKeyProvider, PROVIDER_EVENTS, SafeEventEmitterProvider } from "@web3auth/ethereum-provider";
import Web3 from "web3";

export const setupProvider = async (params: { privKey: string; chainConfig: CustomChainConfig }): Promise<SafeEventEmitterProvider> => {
  const providerFactory = new EthereumPrivateKeyProvider({ config: { chainConfig: params.chainConfig } });
  await providerFactory.init();
  return new Promise((resolve, reject) => {
    // check if provider is ready
    if (providerFactory.state._initialized) {
      const provider = providerFactory.setupProvider(params.privKey);
      resolve(provider);
      return;
    }

    // wait for provider to get ready
    providerFactory.once(PROVIDER_EVENTS.INITIALIZED, async () => {
      const provider = providerFactory.setupProvider(params.privKey);
      resolve(provider);
    });
    providerFactory.on(PROVIDER_EVENTS.ERRORED, (error) => {
      reject(error);
    });
  });
};

export const signEthMessage = async (provider: SafeEventEmitterProvider): Promise<any> => {
  const web3 = new Web3(provider as any);
  const accounts = await (web3.currentProvider as any)?.sendAsync({
    method: "eth_accounts",
    params: [],
  });
  // hex message
  const message = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
  const jrpcResult = await (web3.currentProvider as any)?.sendAsync({
    method: "eth_sign",
    params: [accounts[0], message],
    from: accounts[0],
  });
  return jrpcResult;
};

export const signTypedData_v1 = async (provider: SafeEventEmitterProvider): Promise<any> => {
  const web3 = new Web3(provider as any);
  const accounts = await (web3.currentProvider as any)?.sendAsync({
    method: "eth_accounts",
    params: [],
  });
  const typedData = [
    {
      type: "string",
      name: "message",
      value: "Hi, Alice!",
    },
    {
      type: "uint8",
      name: "value",
      value: 10,
    },
  ];
  return (web3.currentProvider as any)?.sendAsync({
    method: "eth_signTypedData",
    params: [typedData, accounts[0]],
    from: accounts[0],
  });
};

export const fetchLatestBlock = async (provider: SafeEventEmitterProvider): Promise<any> => {
  const web3 = new Web3(provider as any);
  const block = await web3.eth.getBlock("latest");
  return block;
};
