export const fetchTransactions = async (address: string, apiKey: string, fromBlock: number, toBlock: number) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("X-Alchemy-Token", apiKey);

  const raw = JSON.stringify({
    "jsonrpc": "2.0",
    "id": 0,
    "method": "alchemy_getAssetTransfers",
    "params": [
      {
        "fromBlock": `0x${ Math.floor(fromBlock).toString(16) }`,
        "toBlock": `0x${ Math.floor(toBlock).toString(16) }`,
        "fromAddress": address,
        "maxCount": "0x3e8", // 1000
        "excludeZeroValue": false,
        "category": [
          "external",
          "internal"
        ]// can include "internal", "token", "erc20", "erc721", "erc1155"
      }
    ]
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  };

  const dataJson = await fetch(`https://eth-mainnet.alchemyapi.io/v2/${ apiKey }`, requestOptions);
  return dataJson.json();
}