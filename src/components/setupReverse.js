import { ethers } from "ethers";
import { useState, useRef, useEffect } from "react";
import "../stylesheets/setupReverse.css"
import Nav from "./Nav";
import { getReverseName, setReverseName } from "../ens";



export default function SetupReverse() {
    const nameRef = useRef("")

    const [name, setName] = useState("")
    const [userAddress, setUserAddress] = useState("")
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    
    useEffect( async() => {
        setUserAddress(await signer.getAddress())
        setName(await getReverseName(userAddress))
      }, [])


    return(
        <div>
        <Nav />
        <div className="setupComponent"> 
            <h1>Your current name: {name}</h1>
            <input className="reverseNameField" type="text" placeholder="Change name" ref={nameRef}/>
            <button onClick={() => {setReverseName(nameRef.current.value, userAddress)}}>Set name for your address</button>
        </div>
        </div>
    )
}
