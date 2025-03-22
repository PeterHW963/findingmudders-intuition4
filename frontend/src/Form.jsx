import { useState } from "react";
import "./App.css";

function App() {
  const [answers, setAnswers] = useState({ question1: "", question2: "", question3: "", question4: "", question5: "" });
  const [tempAnswers, setTempAnswers] = useState({ question1: "", question2: "", question3: "", question4: "", question5: "" });

  const handleChange = (e) => {
    setTempAnswers({ ...tempAnswers, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setAnswers(tempAnswers); // Update answers only on submit
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
        Q2: What are the requirements of your application?
        <input type="text" name="question2" value={tempAnswers.question2} onChange={handleChange} style={{ display: "block", margin: "10px 0", width: "100%" }} />
      </label>
      <label>
        Q3: How many hours a day are you willing to commit?
        <input type="text" name="question3" value={tempAnswers.question3} onChange={handleChange} style={{ display: "block", margin: "10px 0", width: "100%" }} />
      </label>
      <label>
        Q4: When do you want this project to be completed by? Enter in terms of months/weeks.
        <input type="text" name="question4" value={tempAnswers.question4} onChange={handleChange} style={{ display: "block", margin: "10px 0", width: "100%" }} />
      </label>
      <label>
        Q5: What tech stack do you want to use? (optional)
        <input type="text" name="question5" value={tempAnswers.question5} onChange={handleChange} style={{ display: "block", margin: "10px 0", width: "100%" }} />
      </label>

      <div>
        <button onClick={handleSubmit} style={{ marginTop: "10px", padding: "10px" }}>
          Submit
        </button>
      </div>

      <label>
        The following is your submitted input... Kindly check if this is correct!
        <div>{answers.question1}</div>
        <div>{answers.question2}</div>
        <div>{answers.question3}</div>
        <div>{answers.question4}</div>
        <div>{answers.question5}</div>
      </label>

    </div>
  );
}

export default App;
