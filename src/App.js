import Onboard from "@web3-onboard/core";

import { useState } from "react";
import {
  VStack,
  Button,
  Text,
  HStack,
  Select,
  Box,
  Image,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { toHex, truncateAddress } from "./utils";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import walletLinkModule from "@web3-onboard/walletlink";

const MAINNET_RPC_URL = `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`;
const ROPSTEN_RPC_URL = `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`;
const RINKEBY_RPC_URL = `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`;

const injected = injectedModule();
const walletConnect = walletConnectModule();
const walletLink = walletLinkModule();

const onboard = Onboard({
  wallets: [walletLink, walletConnect, injected],
  chains: [
    {
      id: "0x1", // chain ID must be in hexadecimel
      token: "ETH", // main chain token
      namespace: "evm",
      label: "Ethereum Mainnet",
      rpcUrl: MAINNET_RPC_URL,
    },
    {
      id: "0x3",
      token: "tROP",
      namespace: "evm",
      label: "Ethereum Ropsten Testnet",
      rpcUrl: ROPSTEN_RPC_URL,
    },
    {
      id: "0x4",
      token: "rETH",
      namespace: "evm",
      label: "Ethereum Rinkeby Testnet",
      rpcUrl: RINKEBY_RPC_URL,
    },
  ],
  appMetadata: {
    name: "My App",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    description: "My app using Onboard",
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
    ],
  },
});

export default function Home() {
  const [_, setProvider] = useState();
  const [account, setAccount] = useState();
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [network, setNetwork] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const wallets = await onboard.connectWallet();
      setIsLoading(true);
      const { accounts, chains, provider } = wallets[0];
      setAccount(accounts[0].address);
      setChainId(chains[0].id);
      setProvider(provider);
      setIsLoading(false);
    } catch (error) {
      setError(error);
    }
  };

  const switchNetwork = async () => {
    await onboard.setChain({ chainId: toHex(network) });
  };

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const disconnect = async () => {
    const [primaryWallet] = await onboard.state.get().wallets;
    if (!primaryWallet) return;
    await onboard.disconnectWallet({ label: primaryWallet.label });
    refreshState();
  };

  const refreshState = () => {
    setAccount("");
    setChainId("");
    setProvider();
  };

  return (
    <div className="wrapper">
      <div className="r-logo">
        <Image src="/logo.svg" />
      </div>

      <div className="container">
        <div className="navbar">
          <div className="aside">
            <p className="nav-one">How it works</p>
            <p>About us</p>
          </div>
        </div>
        <div className="inner-container">
          <div className="il-img">
            <Image src="/valet.png" />
          </div>

          <div>
            <div>
              <Text
                margin="0"
                lineHeight="1.15"
                fontSize={["1.5em", "2em", "3em", "3em"]}
                fontWeight="600"
                textAlign="left"
              >
                Think
              </Text>
              <Text
                margin="0"
                lineHeight="1.15"
                fontSize={["1.5em", "2em", "3em", "3em"]}
                fontWeight="600"
              >
                Forward
              </Text>
              <HStack>
                <Text
                  marginTop="20px"
                  lineHeight="1.15"
                  fontSize={["1em", "1em", "1em", "1em"]}
                  fontWeight="300"
                >
                  Welcome to the world of crypto
                </Text>
              </HStack>
              <Text marginTop="20px">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
                imperdiet, turpis aptent etiam.
              </Text>
              {isLoading && <div>Loading...</div>}
              <HStack>
                {!account ? (
                  <Button
                    marginTop="30px"
                    backgroundColor="#83bbc1"
                    color="#fff"
                    onClick={connectWallet}
                    fontSize="12px"
                  >
                    Connect Wallet
                  </Button>
                ) : (
                  <Button onClick={disconnect}>Disconnect</Button>
                )}
              </HStack>
              <HStack marginTop="20px">
                <HStack>
                  <Text>{`Connection Status: `}</Text>
                  {account ? (
                    <CheckCircleIcon color="green" />
                  ) : (
                    <WarningIcon color="#cd5700" />
                  )}
                </HStack>

                <Tooltip label={account} placement="right">
                  <Text>{`Account: ${truncateAddress(account)}`}</Text>
                </Tooltip>
                <Text>{`Network ID: ${
                  chainId ? Number(chainId) : "No Network"
                }`}</Text>
              </HStack>
              {account && (
                <HStack justifyContent="flex-start" alignItems="flex-start">
                  <Box
                    maxW="sm"
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    padding="10px"
                  >
                    <VStack>
                      <Button onClick={switchNetwork} isDisabled={!network}>
                        Switch Network
                      </Button>
                      <Select
                        placeholder="Select network"
                        onChange={handleNetwork}
                      >
                        <option value="3">Ropsten</option>
                        <option value="4">Rinkeby</option>
                      </Select>
                    </VStack>
                  </Box>
                </HStack>
              )}
              <Text>{error ? error.message : null}</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
