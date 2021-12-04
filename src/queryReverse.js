import Nav from './Nav';
import './queryReverse.css'
import { useState, useRef, useEffect } from "react";
import { namehash } from './utils';
const ethers  = require("ethers");
const resolverABI = require("./contracts/PublicResolver.json");

export default function QueryReverse() {

    const searchRef = useRef("")
    const [userAddress, setUserAddress] = useState("")
    const [name, setName] = useState("")

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const resolverContract = new ethers.Contract("0xe1b344d05b88adf15d73b1b6126f8b43dbe13128", resolverABI, signer)

    useEffect(async() => {
        await provider.send("eth_requestAccounts", []);
        const address = await signer.getAddress();
        setUserAddress(address)
      }, [])
      
    const getReverseName = async() => {
        const address = searchRef.current.value
        const reverseNode = `${address.slice(2)}.addr.reverse`
        const reverseNamehash = namehash(reverseNode)
        const domain = await resolverContract.name(reverseNamehash)
        setName(domain)
    }
    return (
        <div>
        <Nav />
        <div className="search">
        <input className="searchField" type="text" placeholder="Enter address you want to know the name of" ref={searchRef}/>
        <button className="searchButtonComponent" type="submit" onClick={getReverseName}>Search</button>
        <h1>{name}</h1>
        </div>
        </div>
    )
}