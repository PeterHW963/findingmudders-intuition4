import "./App.css";
import SignIn from "./SignIn";
import Form from "./Form";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Confirmation from "./Confirmation";
import Success from "./SuccessPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/form" element={<Form />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
  );
}

export default App;
