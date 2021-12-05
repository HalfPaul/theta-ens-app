import { ethers } from "ethers";
import { labelhash, namehash, decodeContenthash, encodeContenthash } from "./utils";
import { formatsByCoinType } from '@ensdomains/address-encoder';
const registrarABI = require("./contracts/BaseRegistrarImplementation.json");
const registryABI = require("./contracts/ENSregistryABI.json");
const resolverABI = require("./contracts/PublicResolver.json");
const controllerABI = require("./contracts/RegistrarController.json");
const reverseABI = require("./contracts/ReverseRegistrar.json");


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const address = signer.getAddress();

const ensResolver = "0xe1b344d05b88adf15d73b1b6126f8b43dbe13128";

//Ideally secret would be randomly generated hash like this.
const secret = "0x0a6c9a9a231400596e50934c80c699fefc0d9969e32061da61f20d4214ac5f7f";

const registryContract = new ethers.Contract("0x846f8ddd20d728abc8351e42475bd77f1c76ba8e", registryABI, signer)
const registrarContract = new ethers.Contract("0x9d839b6851bbd40a9da690f2a9b18a69da67617e", registrarABI, signer)
const resolverContract = new ethers.Contract("0xe1b344d05b88adf15d73b1b6126f8b43dbe13128", resolverABI, signer)
const controllerContract = new ethers.Contract("0xf0b08d84d2604fc2997460dcb2aef52cc3658c45", controllerABI, signer)
const reverseRegistrarContract = new ethers.Contract("0x6fa9d9f1541c0610c473b49d93801c4971f16a30", reverseABI, signer)


// Checks if domain is available. 
export const isDomainAvailable = async(domain) => {
    const available = await controllerContract.available(domain)
    return available
}

//Returns owner/registrant of domain.
export const getRegistrant = async(domain) => {
    const label = ethers.BigNumber.from(labelhash(domain)).toString()
    const output = await registrarContract.ownerOf(label)
    return output
}

//Returns controller of domain
export const getController = async(domain) => {
    const label = namehash(domain + ".theta")
    const output = await registryContract.owner(label)
    return output
}

//Returns ETH address of domain(same as registrant address as default).
export const getEthereumAddress = async(domain) => {
    const label = namehash(domain + ".theta")
    const ethAddress = await resolverContract['addr(bytes32)'](label)
    return ethAddress
    
}

//Returns url of domain. If not set will return nothing.
export const getText = async(domain, key) => {
    const label = namehash(domain + ".theta")
    const link = await resolverContract['text(bytes32,string)'](label, key)
    return link
}

//Gets content hash of domain.
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

//Registers a domain.
export const registerDomain = async(domain) => {
    const price = await controllerContract.rentPrice(domain)
    const signerAddress = await signer.getAddress()

    const tx = await controllerContract.registerWithConfig(domain, signerAddress, secret, ensResolver, signerAddress, {value: price, gasPrice: 4000000000000, gasLimit: 2000000});
    tx.wait(1)
}

//Transfers controller. Registrant can change controller anytime he wants.
export const changeController = async(domain, newAddress) => {
    const label = namehash(domain + ".theta")
    const tx = await registryContract.setOwner(label, newAddress)
    tx.wait(1)
}

//Transfers registrant. If you transfer registrant you cannot get back the domain.
export const changeRegistrant = async(domain, newAddress) => {
    const label = ethers.BigNumber.from(labelhash(domain)).toString()

    const tx = await registrarContract.transferFrom(address, newAddress, label)
    tx.wait(1)
}

//Sets ethereum address.
export const setEthereumAddress = async(domain, ethAddress) => {
    const label = namehash(domain + ".theta")
    const tx = await resolverContract['setAddr(bytes32,address)'](label, ethAddress, {gasPrice: 4000000000000, gasLimit: 20000000})
    tx.wait(1)
}
//Sets url for domain.
export const setText = async(domain, text, key) => {
    const label = namehash(domain + ".theta")
    const tx = await resolverContract['setText(bytes32,string,string)'](label, key, text, {gasPrice: 4000000000000, gasLimit: 20000000})
    tx.wait(1)
}
//Sets content hash. ipfs://dsfdbd...
export const setContentHash = async(domain, content) => {
    const label = namehash(domain + ".theta")
    const encodedContenthash = encodeContenthash(content)
  
    const tx = await resolverContract.setContenthash(label, encodedContenthash)
    tx.wait(1)
  }

//Get reverse name of address. Returns nothing if user has not set it.
export const getReverseName = async(reverseAddress) => {
    const reverseNode = `${reverseAddress.slice(2)}.addr.reverse`
    const reverseNamehash = namehash(reverseNode)
    const domain = await resolverContract.name(reverseNamehash)
    return domain
}

//User sets the name for his address.
export const setReverseName = async(name, address) => {
    const ownerOfDomain = await getController(name.replace(".theta", ""))
    if (ownerOfDomain == address) {
        const tx = await reverseRegistrarContract.setName(name)
        tx.wait(1)
    } else {
        alert("You are not the owner of this domain")
    }
}

export const setBitcoinAddress = async(domain, BTCaddress) => {
    const data = formatsByCoinType[0].decoder(BTCaddress);
    const name = namehash(domain + ".theta")
    const tx = await resolverContract['setAddr(bytes32,uint256,bytes)'](name, 0, data)
    tx.wait(1)
}
export const getBitcoinAddress = async(domain) => {
    const name = namehash(domain + ".theta")
    const data = await resolverContract['addr(bytes32,uint256)'](name, 0)
    const address = formatsByCoinType[0].encoder(Buffer.from(data.slice(2), 'hex'))
    return address
}
