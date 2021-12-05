import { Route, Routes } from "react-router-dom";
import SetupReverse from './components/setupReverse';
import QueryReverse from "./components/queryReverse";
import Home from './components/Home'
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
