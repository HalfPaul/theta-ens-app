
import './App.css';
import { ethers } from "ethers";
import { useState, useRef, useEffect } from "react";
import { namehash, labelhash } from './utils';

const controllerABI = require("./contracts/RegistrarController.json");
const registrarABI = require("./contracts/BaseRegistrarImplementation.json");
const registryABI = require("./contracts/ENSregistryABI.json");


function App() {
  const inputRef = useRef("")
  const controllerRef = useRef("")
  const registrantRef = useRef("")

  const [results, setResults] = useState("")
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [available, setAvailable] = useState(false)

  const [registrant, setRegistrant] = useState("")
  const [controller, setController] = useState("")

  const [userAddress, setUserAddress] = useState("")

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const registryContract = new ethers.Contract("0x846f8ddd20d728abc8351e42475bd77f1c76ba8e", registryABI, signer)
  const controllerContract = new ethers.Contract("0xf0b08d84d2604fc2997460dcb2aef52cc3658c45", controllerABI, signer)
  const registrarContract = new ethers.Contract("0x9d839b6851bbd40a9da690f2a9b18a69da67617e", registrarABI, signer)

  const ensResolver = "0xe1b344d05b88adf15d73b1b6126f8b43dbe13128";
  const secret = "0x0a6c9a9a231400596e50934c80c699fefc0d9969e32061da61f20d4214ac5f7f";

  useEffect( async() => {
    await provider.send("eth_requestAccounts", []);
    const address = await signer.getAddress();
    setUserAddress(address)
  }, [])

  const handleSubmit = async() => {
    const isAvailable = await controllerContract.available(inputRef.current.value)
    setAvailable(isAvailable)
    const result = isAvailable ? "available" : "unavailable"
    console.log(result)
    setResults(inputRef.current.value + ".theta" + " - " + result)
  }

  const registerDomain = async() => {
    const domain = inputRef.current.value
    const available = await controllerContract.available(domain)

    const price = await controllerContract.rentPrice(domain)
    console.log(price);
    const signerAddress = await signer.getAddress()

    const tx = await controllerContract.registerWithConfig(domain, signerAddress, secret, ensResolver, signerAddress, {value: price, gasPrice: 4000000000000, gasLimit: 2000000});
    tx.wait(1)
  }

  const getRegistrant = async() => {
      const label = ethers.BigNumber.from(labelhash(inputRef.current.value)).toString()
      const output = await registrarContract.ownerOf(label)
      console.log(output)
      setRegistrant(output)
  }

  const getController = async() => {
    const label = namehash(inputRef.current.value + ".theta")
    const output = await registryContract.owner(label)
    console.log(output)
    setController(output)
  }

  const changeController = async() => {
    const domain = namehash(inputRef.current.value + ".theta")
    const tx = await registryContract.setOwner(domain, controllerRef.current.value)
    tx.wait(1)

    getController()
  }

  const changeRegistrant = async() => {
    const label = ethers.BigNumber.from(labelhash(inputRef.current.value)).toString()

    const tx1 = await registrarContract.approve(registrantRef.current.value, label)
    tx1.wait(1)

    const tx2 = await registrarContract.transferFrom(userAddress, registrantRef.current.value, label)
    tx2.wait(1)
    getRegistrant()
  }

  const RegisterButton = () => {
    if (available) {
      return (
        <button type="submit" onClick={registerDomain}>Register domain</button>
      )
    } else if (!available && results.length > 0){
      getRegistrant()
      getController()

      return (
      <div>
        <div>
          <h2>Registrant: {registrant}</h2>
          {(userAddress === registrant) && <input className="registrantField" type="text" placeholder="Enter new registrant" ref={registrantRef}/>}
          {(userAddress === registrant) && <button onClick={changeRegistrant}>Change registrant</button>}
        </div>
        <div>
          <h2>Controller: {controller}</h2>
          {(userAddress === registrant) && <input className="controllerField" type="text" placeholder="Enter new controller" ref={controllerRef}/>}
          {(userAddress === registrant) && <button onClick={changeController}>Change Controller</button>}
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
    <div className="searchComponent">
      <input className="inputField" type="text" placeholder="Enter domain that interests you" ref={inputRef}/>
      <button className="buttonComponent" type="submit" onClick={handleSubmit}>Search</button>
      <Domains />
    </div>
  );
}

export default App;
