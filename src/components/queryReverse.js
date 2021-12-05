import Nav from './Nav';
import '../stylesheets/queryReverse.css'
import { useState, useRef, getRegistrant } from "react";
import { getReverseName, getController } from '../ens';
const ethers  = require("ethers");

export default function QueryReverse() {

    const searchRef = useRef("")
    const [name, setName] = useState("")

    const handleSearch = async() => {
        const reverseName = await getReverseName(searchRef.current.value)
        const ownerOfReverseName = await getController(reverseName.replace(".theta", ""))
        if (ownerOfReverseName == searchRef.current.value){
            setName(reverseName)
        }
    }
    return (
        <div>
        <Nav />
        <div className="search">
        <input className="searchField" type="text" placeholder="Enter address you want to know the name of" ref={searchRef}/>
        <button className="searchButtonComponent" type="submit" onClick={() => {handleSearch()}}>Search</button>
        <h1>{name}</h1>
        </div>
        </div>
    )
}