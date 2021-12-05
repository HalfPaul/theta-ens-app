import { ethers } from "ethers";
import { labelhash, namehash, decodeContenthash, encodeContenthash } from "./utils";

const registrarABI = require("./contracts/BaseRegistrarImplementation.json");
const registryABI = require("./contracts/ENSregistryABI.json");
const resolverABI = require("./contracts/PublicResolver.json");
const controllerABI = require("./contracts/RegistrarController.json");
const reverseABI = require("./contracts/ReverseRegistrar.json");


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const address = signer.getAddress();

const ensResolver = "0xe1b344d05b88adf15d73b1b6126f8b43dbe13128";
const secret = "0x0a6c9a9a231400596e50934c80c699fefc0d9969e32061da61f20d4214ac5f7f";

const registryContract = new ethers.Contract("0x846f8ddd20d728abc8351e42475bd77f1c76ba8e", registryABI, signer)
const registrarContract = new ethers.Contract("0x9d839b6851bbd40a9da690f2a9b18a69da67617e", registrarABI, signer)
const resolverContract = new ethers.Contract("0xe1b344d05b88adf15d73b1b6126f8b43dbe13128", resolverABI, signer)
const controllerContract = new ethers.Contract("0xf0b08d84d2604fc2997460dcb2aef52cc3658c45", controllerABI, signer)
const reverseRegistrarContract = new ethers.Contract("0x6fa9d9f1541c0610c473b49d93801c4971f16a30", reverseABI, signer)

export const getRegistrant = async(domain) => {
    const label = ethers.BigNumber.from(labelhash(domain)).toString()
    const output = await registrarContract.ownerOf(label)
    return output
}

export const getController = async(domain) => {
    const label = namehash(domain + ".theta")
    const output = await registryContract.owner(label)
    return output
}

export const getEthereumAddress = async(domain) => {
    const label = namehash(domain + ".theta")
    const ethAddress = await resolverContract['addr(bytes32)'](label)
    return ethAddress
    
}

export const getUrl = async(domain) => {
    const label = namehash(domain + ".theta")
    const key = "url"
    const link = await resolverContract['text(bytes32,string)'](label, key)
    return link
}

export const getContentHash = async(domain) => {
    const name = namehash(domain + ".theta")
    const content = await resolverContract.contenthash(name)
    const { protocolType, decoded, error } = decodeContenthash(content)
    let contentHash;
    if (typeof decoded != "undefined") {
        contentHash = protocolType + "://" + decoded
    }
    return contentHash
 }

export const registerDomain = async(domain) => {
    const available = await controllerContract.available(domain)

    const price = await controllerContract.rentPrice(domain)
    const signerAddress = await signer.getAddress()

    const tx = await controllerContract.registerWithConfig(domain, signerAddress, secret, ensResolver, signerAddress, {value: price, gasPrice: 4000000000000, gasLimit: 2000000});
    tx.wait(1)
}

export const changeController = async(domain, newAddress) => {
    const label = namehash(domain + ".theta")
    const tx = await registryContract.setOwner(label, newAddress)
    tx.wait(1)
}

export const changeRegistrant = async(domain, newAddress) => {
    const label = ethers.BigNumber.from(labelhash(domain)).toString()

    const tx1 = await registrarContract.approve(newAddress, label)
    tx1.wait(1)

    const tx2 = await registrarContract.transferFrom(address, newAddress, label)
    tx2.wait(1)
}

export const setEthereumAddress = async(domain, ethAddress) => {
    const label = namehash(domain + ".theta")
    const tx = await resolverContract['setAddr(bytes32,address)'](label, ethAddress, {gasPrice: 4000000000000, gasLimit: 20000000})
    tx.wait(1)
}

export const setUrl = async(domain, url) => {
    const label = namehash(domain + ".theta")
    const key = "url"
    const tx = await resolverContract['setText(bytes32,string,string)'](label, key, url, {gasPrice: 4000000000000, gasLimit: 20000000})
    tx.wait(1)
}

export const setContentHash = async(domain, content) => {
    const label = namehash(domain + ".theta")
    const encodedContenthash = encodeContenthash(content)
  
    const tx = await resolverContract.setContenthash(label, encodedContenthash)
    tx.wait(1)
  }

export const getReverseName = async(reverseAddress) => {
    const reverseNode = `${reverseAddress.slice(2)}.addr.reverse`
    const reverseNamehash = namehash(reverseNode)
    const domain = await resolverContract.name(reverseNamehash)
    return domain
}

export const getUserReverseName = async() => {
    const reverseNode = `${address.slice(2)}.addr.reverse`
    const reverseNamehash = namehash(reverseNode)
    const domain = await resolverContract.name(reverseNamehash)
    return domain
  }

export const setReverseName = async(name) => {
    const tx = await reverseRegistrarContract.setName(name)
    tx.wait(1)
  }