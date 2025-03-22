import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function App() {
const [submitted, setSubmitted] = useState(false);
const [confirmed, setConfirmed] = useState(false);

  return(
    <>
      <div></div>
      {submitted ? 
        confirmed ? <Success />
          : <Confirmation setConfirmed={setConfirmed} setSubmitted={setSubmitted}/>
      : <Form setSubmitted={setSubmitted} />}
    </>
  )
}

function Success() {
  const navigate = useNavigate();
  const handleChange = () => {
    navigate("/landing");
  };
  return (
    <>
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h1>Success! Project created 🥳</h1>
      </div>
      <div>
        <button onClick={handleChange}>Return Home</button>
      </div>
    </>
  );
}

function Confirmation({ setConfirmed, setSubmitted }) {
  const handleGoToSuccess = () => {
    setConfirmed(true)
  }
    
  const handleGoToForm = () => {
    setSubmitted(false)
  };
  const [answers, setAnswers] = useState({
    repoName: "",
    repoDescription: "",
    repoPrivacy: "",
    PAT: "",
    isPrivate: "",
  });
  const [tempAnswers, setTempAnswers] = useState({
    repoName: "",
    repoDescription: "",
    repoPrivacy: "",
    PAT: "",
    isPrivate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempAnswers((prev) => ({
      ...prev,
      [name]: name === "isPrivate" ? value === "true" : value,
    }));
  };
  const isFormComplete =
    tempAnswers.repoName.trim() !== "" &&
    tempAnswers.repoDescription.trim() !== "" &&
    tempAnswers.repoPrivacy.trim() !== "" &&
    tempAnswers.PAT.trim() !== "";

  return (
    <>
      <div>
        <label>
          The following is your submitted input... Kindly check if this is
          correct!
        </label>


          <div>DATAAAAAAAAAAAAAAAAAAAaa</div>

        

        <div>
          <label>
            What is your desired repository name?
            <input
              type="text"
              name="repoName"
              value={tempAnswers.repoName}
              onChange={handleChange}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            />
          </label>

          <label>
            What do you want as the repository description?
            <input
              type="text"
              name="repoDescription"
              value={tempAnswers.repoDescription}
              onChange={handleChange}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            />
          </label>

          <label>
            Do you want the privacy of the repository to be private?
            <select
              name="repoPrivacy"
              value={tempAnswers.repoPrivacy}
              onChange={handleChange}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            >
              <option value="">-- Select Privacy--</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label>
            What is your Personal Access Token (PAT)?
            <input
              type="text"
              name="PAT"
              value={tempAnswers.PAT}
              onChange={handleChange}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            />
          </label>
        </div>

        <label>
          <button disabled={!isFormComplete} onClick={handleGoToSuccess}>Confirm!</button>
        </label>

        <label>
          <button onClick={handleGoToForm}>Redo again</button>
        </label>
      </div>
    </>
  );
}

function Form({ setSubmitted }) {

  const [answers, setAnswers] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  const [tempAnswers, setTempAnswers] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });

  const handleChange = (e) => {
    setTempAnswers({ ...tempAnswers, [e.target.name]: e.target.value });
  };



  const handleSubmit = () => {
    setSubmitted(true);
    setAnswers(tempAnswers);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <label>
        Q1: Give us a short description of what you want your app to do?
        <textarea
          name="question1"
          value={tempAnswers.question1}
          onChange={handleChange}
          maxLength={500} // Limit to 500 characters
          style={{
            display: "block",
            margin: "10px 0",
            width: "100%",
            minHeight: "20px", // Initial height
            maxHeight: "200px", // Prevents excessive expansion
            overflowY: "auto", // Enables scrolling if text exceeds max height
            resize: "none", // Prevents manual resizing
          }}
        />
      </label>

      <label>
        Q2: What are the features of your application?
        <input
          type="text"
          name="question2"
          value={tempAnswers.question2}
          onChange={handleChange}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
      </label>
      <label>
        Q3: How many hours a day are you willing to commit?
        <input
          type="text"
          name="question3"
          value={tempAnswers.question3}
          onChange={handleChange}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
      </label>
      <label>
        Q4: When do you want this project to be completed by? Enter in terms of
        months/weeks.
        <input
          type="text"
          name="question4"
          value={tempAnswers.question4}
          onChange={handleChange}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
      </label>
      <label>
        Q5: What tech stack do you want to use? (optional)
        <input
          type="text"
          name="question5"
          value={tempAnswers.question5}
          onChange={handleChange}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
      </label>

      <div>
        <button
          onClick={handleSubmit}
          style={{ marginTop: "10px", padding: "10px" }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
