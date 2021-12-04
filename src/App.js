import { Route, Routes } from "react-router-dom";
import SetupReverse from './setupReverse';
import QueryReverse from "./queryReverse";
import Home from './Home'
function App() {
  
  return (
    <>
    <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/setupReverse" element={<SetupReverse />}/>
        <Route path="/queryReverse" element={<QueryReverse />}/>
    </Routes>
    </>
  );

}

export default App;
