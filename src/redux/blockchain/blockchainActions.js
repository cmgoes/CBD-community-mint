// constants
import Web3EthContract from "web3-eth-contract";
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();
    const provider = await detectEthereumProvider();

    if (provider) {
      if (provider !== window.ethereum) {
        dispatch(connectFailed("Install Metamask."));
      } else {
        const { ethereum } = window;      
        
        Web3EthContract.setProvider(ethereum);
        let web3 = new Web3(ethereum);
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          const networkId = await ethereum.request({
            method: "eth_chainId",
          });
          console.log("networkID", networkId);
          if (networkId === CONFIG.NETWORK.ID) {
            const SmartContractObj = new Web3EthContract(
              abi,
              CONFIG.CONTRACT_ADDRESS
            );
            dispatch(
              connectSuccess({
                account: accounts[0],
                smartContract: SmartContractObj,
                web3: web3,
              })
            );
            // Add listeners start
            ethereum.on("accountsChanged", (accounts) => {
              dispatch(updateAccount(accounts[0]));
            });
            ethereum.on("chainChanged", () => {
              window.location.reload();
            });
            // Add listeners end
          } else {
            dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
          }
        } catch (err) {
          dispatch(connectFailed("Something went wrong."));
        }
        // } else {
        //   dispatch(connectFailed("Install Metamask."));
        // }
      }
    } else {
      console.log('Please install MetaMask!');
    }      
    
  };
};

export const connectmobile = () => {
  return async (dispatch) => {   
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();
    const { ethereum } = window;    
    
      Web3EthContract.setProvider(ethereum);
      let web3 = new Web3(ethereum);      
      const SmartContractObj = new Web3EthContract(
        abi,
        CONFIG.CONTRACT_ADDRESS
      );
      dispatch(
        connectSuccess({              
          smartContract: SmartContractObj,
          web3: web3,
        })
      );         
        
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
