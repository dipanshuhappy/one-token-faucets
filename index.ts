import express, { Application, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import { ABI } from "./token";
import Web3 from "web3";
const POLY_TOKEN_ADDRESS = "0x3022F6b9E3D578Dd90e84abfbef2F75DB838fbB2";
const ETH_TOKEN_ADDRESS = "0xe7399b79838acc8caaa567fF84e5EFd0d11BB010";
const ETH_PROVIDER =
  "https://eth-sepolia.g.alchemy.com/v2/z9xzfmxaZkYiqOqNwBNfG0Hu6IBqPLN8";
const POLY_PROVIDER =
  "https://polygon-mumbai.g.alchemy.com/v2/HF4M_M-GmS3kW_tVGbR2PEr_xYd1L2zA";
const POLY_CHAIN_ID = 80001;
const ETH_CHAIN_ID = 11155111;

const app: Application = express();
const port = 3000;
//@ts-ignore
BigInt.prototype.toJSON = function () {
  // <------------
  return this.toString(); // <--- SOLUTION
};

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 15 minutes
  max: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(limiter);
app.set("trust proxy", true);

app.get("/", async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "Hello World!",
  });
});

app.post(
  "/faucets",
  bodyParser.json(),
  async (req: Request, res: Response): Promise<Response> => {
    const { address, chainId } = req.body;
    console.log(address);
    const accountAddress = "0x62e9a8374AE3cdDD0DA7019721CcB091Fed927aE";
    let contractAddress = "";
    let proiverUrl = "";
    if (chainId == ETH_CHAIN_ID) {
      contractAddress = ETH_TOKEN_ADDRESS;
      proiverUrl = ETH_PROVIDER;
    } else {
      contractAddress = POLY_TOKEN_ADDRESS;
      proiverUrl = POLY_PROVIDER;
    }
    console.log(ETH_TOKEN_ADDRESS);
    const web3 = new Web3(new Web3.providers.HttpProvider(proiverUrl));
    const signer = web3.eth.accounts.privateKeyToAccount(
      "0xb2b613d940b42b6f27d3cb5234d71dd808f6634ceb826d82b0231244be5a993c"
    );
    web3.eth.accounts.wallet.add(signer);
    let myContract = new web3.eth.Contract(
      [
        {
          inputs: [
            {
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_value",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          type: "function",
        },
      ],
      contractAddress,
      { from: signer.address }
    );
    //@ts-ignore

    const nonce = await web3.eth.getTransactionCount(accountAddress, "latest"); //get latest nonce
    const gasPrice = await web3.eth.getGasPrice();
    const amount = web3.utils.toWei("1", "ether");
    console.log(amount, "amount", address, "address");
    let data = myContract.methods
      //@ts-ignore
      .transfer(address, amount)
      .encodeABI();
    // const gasEstimate = await web3.eth.estimateGas({
    //   to: address,
    //   data: data,
    // });
    //@ts-ignore
    const receipt = await myContract.methods
      //@ts-ignore
      .transfer(address, amount)
      .send({
        from: signer.address,
        gas: (6000000).toString(),
      })
      .on("transactionHash", (hash: any) => {
        console.log(hash, "hash");
      })

      .catch(console.error);

    // let txObj = {
    //   nonce: BigInt(parseInt(nonce.toString()) + 10),
    //   to: contractAddress,
    //   gasPrice: web3.utils.toHex(gasPrice),
    //   value: "0x0",
    //   data: data,
    //   gas: (6000000).toString(),
    //   from: signer.address,
    // };
    // console.log(txObj, "txObj");
    // web3.eth.accounts
    //   .signTransaction(
    //     txObj,
    //     "b2b613d940b42b6f27d3cb5234d71dd808f6634ceb826d82b0231244be5a993c"
    //   )
    //   .then((signedTx) => {
    //     web3.eth
    //       .sendSignedTransaction(signedTx.rawTransaction)
    //       .then((receipt) => {
    //         return res.status(200).send({ ...receipt });
    //       });
    //   })
    //   .catch((err) => {
    //     return res.status(400).send({ message: err.message });
    //   });
    // const signedTx = await web3.eth.accounts.signTransaction(
    //   txObj,
    //   "b2b613d940b42b6f27d3cb5234d71dd808f6634ceb826d82b0231244be5a993c"
    // );
    // console.log(signedTx, "signedTx");

    // const receipt = await web3.eth
    //   .sendSignedTransaction(signedTx.rawTransaction)
    //   .on("error", (err) => {
    //     console.error(err, "this is on err");
    //   })
    //   .on("sending", () => {
    //     console.log("it is sending");
    //   })
    //   .on("sent", () => {
    //     console.log("it has sent");
    //   });
    console.log(receipt, "receipt");

    return res.status(200).send({ ...receipt });
  }
);

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}
