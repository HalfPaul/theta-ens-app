import { ethers } from "ethers";
import { useState, useRef, useEffect } from "react";
import { namehash } from "./utils";
import "./setupReverse.css"
import Nav from "./Nav";
const reverseABI = require("./contracts/ReverseRegistrar.json");
const resolverABI = require("./contracts/PublicResolver.json");

export default function SetupReverse() {

    const nameRef = useRef("")

    const [name, setName] = useState("")
    const [userAddress, setUserAddress] = useState("")

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const reverseRegistrarContract = new ethers.Contract("0x6fa9d9f1541c0610c473b49d93801c4971f16a30", reverseABI, signer)
    const resolverContract = new ethers.Contract("0xe1b344d05b88adf15d73b1b6126f8b43dbe13128", resolverABI, signer)

    useEffect( async() => {
        await provider.send("eth_requestAccounts", []);
        const address = await signer.getAddress();
        setUserAddress(address)
        getReverseName()
      }, [])

      const setReverseName = async() => {
        const tx = await reverseRegistrarContract.setName(nameRef.current.value)
        tx.wait(1)
        getReverseName()
      }

      const getReverseName = async() => {
        const address = await signer.getAddress()
        const reverseNode = `${address.slice(2)}.addr.reverse`
        const reverseNamehash = namehash(reverseNode)
        const domain = await resolverContract.name(reverseNamehash)
        setName(domain)
      }

    return(
        <div>
        <Nav />
        <div className="setupComponent"> 
            <h1>Your current name: {name}</h1>
            <input className="reverseNameField" type="text" placeholder="Change name" ref={nameRef}/>
            <button onClick={setReverseName}>Set name for your address</button>
        </div>
        </div>
    )
}
