import "./App.css";
import SignIn from "./SignIn";
import Form from "./Form";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/form" element={<Form />} />
      </Routes>
    </Router>
  );
}

export default App;
