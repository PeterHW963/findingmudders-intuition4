import "./App.css";
import SignIn from "./SignIn";
import Form from "./Form";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import { AppProvider } from "./AppContext";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/form" element={<Form />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
