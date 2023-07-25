"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const web3_1 = __importDefault(require("web3"));
const POLY_TOKEN_ADDRESS = "0x5E906C9f094906c80F34e8524C8Eec81D19CEcD2";
const ETH_TOKEN_ADDRESS = "0xe5cdFC9a5A59E9949f6C31aB05De8d7DB414756F";
const ETH_PROVIDER = "https://eth-sepolia.g.alchemy.com/v2/z9xzfmxaZkYiqOqNwBNfG0Hu6IBqPLN8";
const POLY_PROVIDER = "https://polygon-mumbai.g.alchemy.com/v2/HF4M_M-GmS3kW_tVGbR2PEr_xYd1L2zA";
const POLY_CHAIN_ID = 80001;
const ETH_CHAIN_ID = 11155111;
const app = (0, express_1.default)();
const port = 3000;
//@ts-ignore
BigInt.prototype.toJSON = function () {
    // <------------
    return this.toString(); // <--- SOLUTION
};
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 24 * 60 * 60 * 1000,
    max: 2,
    standardHeaders: true,
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Body parsing Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use(limiter);
app.set("trust proxy", true);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).send({
        message: "Hello World!",
    });
}));
app.post("/faucets", body_parser_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, chainId } = req.body;
    console.log(address);
    console.log(chainId, "chainid");
    console.log(req.body, "body");
    const accountAddress = "0x62e9a8374AE3cdDD0DA7019721CcB091Fed927aE";
    let contractAddress = "";
    let proiverUrl = "";
    if (chainId == ETH_CHAIN_ID) {
        contractAddress = ETH_TOKEN_ADDRESS;
        proiverUrl = ETH_PROVIDER;
    }
    else {
        contractAddress = POLY_TOKEN_ADDRESS;
        proiverUrl = POLY_PROVIDER;
    }
    console.log(ETH_TOKEN_ADDRESS);
    const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(proiverUrl));
    const signer = web3.eth.accounts.privateKeyToAccount("0xb2b613d940b42b6f27d3cb5234d71dd808f6634ceb826d82b0231244be5a993c");
    web3.eth.accounts.wallet.add(signer);
    let myContract = new web3.eth.Contract([
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
    ], contractAddress, { from: signer.address });
    //@ts-ignore
    const nonce = yield web3.eth.getTransactionCount(accountAddress, "latest"); //get latest nonce
    const gasPrice = yield web3.eth.getGasPrice();
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
    const receipt = yield myContract.methods
        //@ts-ignore
        .transfer(address, amount)
        .send({
        from: signer.address,
        gas: (6000000).toString(),
    })
        .on("transactionHash", (hash) => {
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
    return res.status(200).send(Object.assign({}, receipt));
}));
try {
    app.listen(port, () => {
        console.log(`Connected successfully on port ${port}`);
    });
}
catch (error) {
    console.error(`Error occured: ${error}`);
}
