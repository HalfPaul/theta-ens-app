import '../stylesheets/Home.css';
import Nav from './Nav';
import { ethers } from "ethers";
import { useState, useRef, useEffect } from "react";

import { getRegistrant, getController,
        getEthereumAddress, setText,
        getContentHash, registerDomain,
        changeController, changeRegistrant,
        setEthereumAddress, getText, setContentHash,
        isDomainAvailable, setBitcoinAddress, getBitcoinAddress } from '../ens.js';



export default function Home() {

  //Refs are used for knowing what is written in an input field.
  const inputRef = useRef("")
  const controllerRef = useRef("")
  const registrantRef = useRef("")
  const ethAddressRef = useRef("")
  const bitcoinRef = useRef("")
  const urlRef = useRef("")
  const contentHashRef = useRef("")

  const [results, setResults] = useState("")
  const [available, setAvailable] = useState(false)

  const [registrant, setRegistrant] = useState("")
  const [controller, setController] = useState("")
  const [ethAddress, setEthAddress] = useState("")
  const [bitcoin, setBitcoin] = useState("")
  const [url, setUrlName] = useState("")
  const [content, setContent] = useState("")

  const [userAddress, setUserAddress] = useState("")

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  useEffect( async() => {
    //Handles Metamask connection.
    await provider.send("eth_requestAccounts", []);
    const address = await signer.getAddress();
    setUserAddress(address)
  }, [])

  const handleSubmit = async() => {
    const isAvailable = await isDomainAvailable(inputRef.current.value)
    setAvailable(isAvailable)

    const result = isAvailable ? "available" : "unavailable"
    setResults(inputRef.current.value + ".theta" + " - " + result)

    //If domain is not available(someone owns it), site will return qualities of domain.
    if (!available) {
      setRegistrant(await getRegistrant(inputRef.current.value))
      setController(await getController(inputRef.current.value))
      setEthAddress(await getEthereumAddress(inputRef.current.value))
      setUrlName(await getText(inputRef.current.value, "url"))
      setContent(await getContentHash(inputRef.current.value))
      setBitcoin(await getBitcoinAddress(inputRef.current.value))
    }
    

  }

  const RegisterButton = () => {
    if (available) {
      return (
        <button type="submit" onClick={() => {registerDomain(inputRef.current.value)}}>Register domain</button>
      )
    } else if (!available && results.length > 0){
      return (
      <div>
        <div>
          <h2>Registrant: {registrant}</h2>
          {(userAddress === registrant) && <input className="registrantField" type="text" placeholder="Enter new registrant" ref={registrantRef}/>}
          {(userAddress === registrant) && <button onClick={() => {changeRegistrant(inputRef.current.value, registrantRef.current.value)}}>Change registrant</button>}
        </div>
        <div>
          <h2>Controller: {controller}</h2>
          {(userAddress === registrant) && <input className="controllerField" type="text" placeholder="Enter new controller" ref={controllerRef}/>}
          {(userAddress === registrant) && <button onClick={() => {changeController(inputRef.current.value, controllerRef.current.value)}}>Change Controller</button>}
        </div>
        <div>
          <h1 className="recordSection">Record Section</h1>
          <h3>ETH Adress: {ethAddress}</h3>
          {(userAddress === controller) && <input className="ethAddressField" type="text" placeholder="Enter new ETH address" ref={ethAddressRef}/>}
          {(userAddress === controller) && <button onClick={() => {setEthereumAddress(inputRef.current.value, ethAddressRef.current.value)}}>Change ETH address.</button>}
          <h3>Bitcoin address: {bitcoin}</h3>
          {(userAddress === controller) && <input className="btcAddressField" type="text" placeholder="Enter new BTC address" ref={bitcoinRef}/>}
          {(userAddress === controller) && <button onClick={() => {setBitcoinAddress(inputRef.current.value, bitcoinRef.current.value)}}>Change BTC address.</button>}
          <h3>URL: {url}</h3>
          {(userAddress === controller) && <input className="urlField" type="text" placeholder="Enter new url" ref={urlRef}/>}
          {(userAddress === controller) && <button onClick={() => {setText(inputRef.current.value, urlRef.current.value, "url")}}>Change URL.</button>}
          <h3>Content hash: {content}</h3>
          {(userAddress === controller) && <input className="contentField" type="text" placeholder="Enter new content hash e.g: ipfs://CF..." ref={contentHashRef}/>}
          {(userAddress === controller) && <button onClick={() => {setContentHash(inputRef.current.value, contentHashRef.current.value)}}>Change Content Hash.</button>}

        </div>
      </div>
      )
    }
    
    return (<p></p>)
  }
  const Domains = () => {
    return (
      <div>
        <h2>{results}</h2>
        <RegisterButton />
      </div>
    )
  }


  return (
    <div>
      <Nav />
      <div className="searchComponent">
        <input className="inputField" type="text" placeholder="Enter domain that interests you" ref={inputRef}/>
        <button className="buttonComponent" type="submit" onClick={handleSubmit}>Search</button>
        <Domains />
      </div>
    </div>
  );
}
