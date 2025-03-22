import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [response, setResponse] = useState(null);

  return (
    <>
      <div>
        <h1>RicoAI</h1>
      </div>
      {submitted ? (
        confirmed ? (
          <Success />
        ) : (
          <Confirmation
            setConfirmed={setConfirmed}
            setSubmitted={setSubmitted}
            response={response}
          />
        )
      ) : (
        <Form setResponse={setResponse} setSubmitted={setSubmitted} />
      )}
    </>
  );
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

function Confirmation({ setConfirmed, setSubmitted, response }) {
  const handleGoToSuccess = () => {
    setConfirmed(true);
  };

  const handleGoToForm = () => {
    setSubmitted(false);
  };
  const [answers, setAnswers] = useState({
    repoName: "",
    repoDescription: "",
    repoPrivacy: "",
    PAT: "",
    isPrivate: "",
  });
  const [touched, setTouched] = useState({
    repoName: false,
    repoDescription: false,
    repoPrivacy: false,
    PAT: false,
    isPrivate: false,
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

        {response ? (
          <div>
            <h3>Project Details:</h3>
            <div>{JSON.stringify(response)}</div>
          </div>
        ) : (
          <p>No data available.</p>
        )}

        <Box
          component="form"
          sx={{
            maxWidth: 7500,
            mx: "auto",
            p: 3,
            border: "1px solid #ccc",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="body1" mt={2} align="left">
            Q1: Enter a repository name
          </Typography>
          <TextField
            fullWidth
            name="repoName"
            value={tempAnswers.repoName}
            onChange={handleChange}
            margin="normal"
            required
            error={touched.repoName && tempAnswers.repoName === ""}
            helperText={
              touched.repoName && tempAnswers.repoName === ""
                ? "This field is required"
                : ""
            }
          />

          <Typography variant="body1" mt={3} mb={1} align="left">
            Q2: Enter a repository description
          </Typography>
          <TextField
            fullWidth
            name="repoDescription"
            multiline
            rows={4}
            value={tempAnswers.repoDescription}
            onChange={handleChange}
            margin="normal"
            required
            error={
              touched.repoDescription && tempAnswers.repoDescription === ""
            }
            helperText={
              touched.repoDescription && tempAnswers.repoDescription === ""
                ? "This field is required"
                : ""
            }
          />

          <Typography variant="body1" mt={3} mb={1} align="left">
            Q3: Select repository accessibility
          </Typography>
          <FormControl
            variant="outlined"
            sx={{ width: "100%", alignSelf: "left" }}
          >
            <Select
              labelId="repoPrivacy-label"
              id="repoPrivacy"
              name="repoPrivacy"
              value={tempAnswers.repoPrivacy}
              onChange={handleChange}
              displayEmpty
              align="start"
            >
              {/* Placeholder MenuItem must have value="" */}
              <MenuItem value="">
                <em>-- Select Privacy --</em>
              </MenuItem>
              <MenuItem value="false">Public</MenuItem>
              <MenuItem value="true">Private</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body1" mt={3} mb={1} align="left">
            Q4: Enter your Github Personal Access Token (PAT)
          </Typography>
          <TextField
            fullWidth
            name="PAT"
            value={tempAnswers.PAT}
            onChange={handleChange}
            margin="normal"
            required
            error={touched.PAT && tempAnswers.PAT === ""}
            helperText={
              touched.PAT && tempAnswers.PAT === ""
                ? "This field is required"
                : ""
            }
          />
        </Box>
        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button
            variant="contained"
            disabled={!isFormComplete}
            onClick={handleGoToSuccess}
            sx={{
              backgroundColor: "black",
              color: "white",
              "&:hover": {
                backgroundColor: "#333",
              },
            }}
          >
            Confirm
          </Button>

          <Button
            variant="outlined"
            onClick={handleGoToForm}
            sx={{
              borderColor: "black",
              color: "black",
              "&:hover": {
                backgroundColor: "#f0f0f0",
                borderColor: "black",
              },
            }}
          >
            Edit
          </Button>
        </Box>
      </div>
    </>
  );
}

function Form({ setSubmitted, setResponse }) {
  const [answers, setAnswers] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  const [touched, setTouched] = useState({
    question1: false,
    question2: false,
    question3: false,
    question4: false,
    question5: false,
  });
  const [tempAnswers, setTempAnswers] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });
  const isFormComplete =
    tempAnswers.question1.trim() !== "" &&
    tempAnswers.question2.trim() !== "" &&
    tempAnswers.question3.trim() !== "" &&
    tempAnswers.question4.trim() !== "";
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setTempAnswers({ ...tempAnswers, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const api = axios.create({
    baseURL: "https://ricoai1-526454760b6c.herokuapp.com",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/generate-project-data", {
        project_description: tempAnswers.question1,
        features: tempAnswers.question2,
        duration: tempAnswers.question4,
        hours_per_day: tempAnswers.question3,
        tech_stack: tempAnswers.question5,
      });

      console.log("✅ Response:", response.data);
      setResponse(response.data);
      setSubmitted(true);
      setLoading(false);
      setAnswers(tempAnswers); // make sure tempAnswers is defined
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Axios Error:", error.message);
        console.log("Response:", error.response);
      } else {
        console.error("❌ Unknown Error:", error);
      }
    }
  };

  return (
    <Box
      component="form"
      sx={{
        maxWidth: 600,
        mx: "auto",
        p: 3,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="body1" mt={2} align="left">
        Q1: Give us a short description of what you want your app to do?
      </Typography>
      <TextField
        fullWidth
        name="question1"
        value={tempAnswers.question1}
        onChange={handleChange}
        margin="normal"
        required
        error={touched.question1 && tempAnswers.question1 === ""}
        helperText={
          touched.question1 && tempAnswers.question1 === ""
            ? "This field is required"
            : ""
        }
      />

      <Typography variant="body1" mt={3} mb={1} align="left">
        Q2: What are the features of your application?
      </Typography>
      <TextField
        fullWidth
        name="question2"
        multiline
        rows={4}
        value={tempAnswers.question2}
        onChange={handleChange}
        margin="normal"
        required
        error={touched.question2 && tempAnswers.question2 === ""}
        helperText={
          touched.question2 && tempAnswers.question2 === ""
            ? "This field is required"
            : ""
        }
      />

      <Typography variant="body1" mt={3} mb={1} align="left">
        Q3: How many hours a day are you willing to commit?
      </Typography>
      <TextField
        fullWidth
        type="number"
        inputProps={{ min: 1 }}
        name="question3"
        rows={4}
        value={tempAnswers.question3}
        onChange={handleChange}
        margin="normal"
        required
        error={
          touched.question3 &&
          (tempAnswers.question3 === "" ||
            !Number.isInteger(Number(tempAnswers.question3)))
        }
        helperText={
          touched.question3 &&
          (tempAnswers.question3 === "" ||
            !Number.isInteger(Number(tempAnswers.question3)))
            ? "Please enter a valid whole number"
            : ""
        }
      />
      <Typography variant="body1" mt={3} mb={1} align="left">
        Q4: When do you want this project to be completed by? Enter in terms
        months/weeks.
      </Typography>
      <TextField
        fullWidth
        name="question4"
        value={tempAnswers.question4}
        onChange={handleChange}
        margin="normal"
        required
        error={touched.question4 && tempAnswers.question4 === ""}
        helperText={
          touched.question4 && tempAnswers.question4 === ""
            ? "This field is required"
            : ""
        }
      />

      <Typography variant="body1" mt={3} mb={1} align="left">
        Q5: What tech stack do you want to use? (optional)
      </Typography>
      <TextField
        fullWidth
        name="question5"
        value={tempAnswers.question5}
        onChange={handleChange}
        margin="normal"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          mt: 2,
          backgroundColor: loading ? "#666" : "black",
          color: "white",
          "&:hover": {
            backgroundColor: loading ? "#666" : "#333",
          },
        }}
        onClick={handleSubmit}
        disabled={loading || !isFormComplete}
      >
        {loading && (
          <CircularProgress size={20} sx={{ color: "white", mr: 2 }} />
        )}
        {loading ? "Processing..." : "Submit"}
      </Button>
    </Box>
  );
}
