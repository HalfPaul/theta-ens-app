import { NavLink } from "react-router-dom";

function Nav() {
    return (
        <div className="Nav">
            <nav>
                <ul className="navLinks">

                    <li><NavLink to="/"> Home </NavLink></li>
                    <li><NavLink to="/setupReverse">Setup reverse records</NavLink></li>
                    <li><NavLink to="/queryReverse">Query reverse records</NavLink></li>
                </ul>
            </nav>
        </div>
    )
}

export default Nav;