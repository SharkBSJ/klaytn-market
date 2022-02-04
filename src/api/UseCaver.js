import Caver from 'caver-js';
// import CounterABI from '../abi/CounterABI.json'
import KIP17TokenABI from '../abi/KIP17TokenABI.json'
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY, COUNT_CONTRACT_ADDRESS, CHAIN_ID, NFT_CONTRACT_ADDRESS } from '../constants'

export const option = {
  headers: [
    {
      name: "Authorization",
      value: "Basic " + Buffer.from(ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY).toString("base64")
    },
    {
      name: "x-chain-id", value: CHAIN_ID
    }
  ]
}

export const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option));
export const NFTContract = new caver.contract(KIP17TokenABI, NFT_CONTRACT_ADDRESS);

export const fetchCardsOf = async (address) => {
  // Fetch Balance
  const _balance = await NFTContract.methods.balanceOf(address).call();
  console.log(`NFT Balance : ${_balance}`);
  // Fetch Token IDs
  const tokenIds = [];
  for (let i=0; i<_balance; i++) {
    const _id = await NFTContract.methods.tokenOfOwnerByIndex(address, i).call();
    tokenIds.push(_id);
  }
  // Fetch Token URIs
  const tokenURIs = [];
  for (let i=0; i<_balance; i++) {
    const uri = await NFTContract.methods.tokenURI(tokenIds[i]).call();
    tokenURIs.push(uri);
  }
  
  const nfts = []
  for (let i=0; i<_balance; i++) {
    nfts.push({uri: tokenURIs[i], id: tokenIds[i]});
  }

  console.log(nfts);
  return nfts;
}

export const getBalance = (address) => {
  return caver.rpc.klay.getBalance(address).then((response) => {
    const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response));
    console.log(`BALANCE: ${balance}`);
    return balance;
  });
}

// export const CountContract = new caver.contract(CounterABI, COUNT_CONTRACT_ADDRESS);

// export const readCount = async () => {
//   const _count = await CountContract.methods.count().call();
//   console.log(_count);
// }

// export const setCount = async (newCount) => {
//   try {
//     const privateKey = '0xedbf5744957285d53d5b9eebf68de27db19cd03690cc3e0416110db108421005';
//     const deployer = caver.wallet.keyring.createFromPrivateKey(privateKey);
//     caver.wallet.add(deployer);

//     const receipt = await CountContract.methods.setCount(newCount).send({
//       from: deployer.address,
//       gas: "0x4bfd200"
//     })
//     console.log(receipt);
//   } catch (error) {
//     console.log(`[ERROR_SET_COUNT]${error}`)
//   }
// }
