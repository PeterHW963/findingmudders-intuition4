import React, { useState, useContext  } from "react";
import { useNavigate } from "react-router-dom";

export default function Confirmation() {

  const navigate = useNavigate();
  const handleGoToForm = () => {
    navigate("/form");
  };
  const handleConfirmation = () => {
    navigate("/success");
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
          <button disabled={!isFormComplete} onClick={handleConfirmation}>
            Confirm!
          </button>
        </label>

        <label>
          <button onClick={handleGoToForm}>Redo again</button>
        </label>
      </div>
    </>
  );
}
