import Nav from './Nav';
import '../stylesheets/queryReverse.css'
import { useState, useRef, useEffect } from "react";
import { getReverseName } from '../ens';
const ethers  = require("ethers");

export default function QueryReverse() {

    const searchRef = useRef("")
    const [name, setName] = useState("")

    const handleSearch = async() => {
        setName(await getReverseName(searchRef.current.value))
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