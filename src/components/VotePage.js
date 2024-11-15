import React, { useState, useEffect } from "react";
import { supabase } from "./client";
import AvatarComponent from "./Avatar/AvatarComponent";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "./css/VotePage.css";
import Button from "@mui/material/Button";

function VotePage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [userCourse, setUserCourse] = useState(null);
  const navigate = useNavigate();

  // Check if the user has already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("voteStatus, course")
          .eq("studentNumber", user.email.split("@")[0]) // Extract studentNumber
          .single();

        if (error) {
          console.error("Error checking vote status:", error);
          return;
        }

        if (data?.voteStatus === "voted") {
          navigate("/thank-you");
        } else {
          setUserCourse(data.course); // Set user's course for vote counting
        }
      }
    };
    checkVoteStatus();
  }, [navigate]);

  // Fetch candidates from the database
  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase.from("candidates").select("*");
      if (error) {
        console.error("Error fetching candidates:", error);
        return;
      }
      setCandidates(data);
    };
    fetchCandidates();
  }, []);

  // Handle selecting a candidate
  const handleCandidateSelect = (position, candidateID) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [position]: prev[position] === candidateID ? null : candidateID,
    }));
  };

  // Handle submitting the vote
  const handleSubmitVote = async () => {
    const allPositionsSelected = Object.keys(groupedCandidates).every(
      (position) => selectedCandidates[position]
    );

    if (!allPositionsSelected) {
      alert("Please select a candidate for each position.");
      return;
    }

    if (!userCourse) {
      alert("Unable to retrieve course information. Please try again.");
      return;
    }

    try {
      for (const position in selectedCandidates) {
        const candidateID = selectedCandidates[position];

        // Check if a row for the candidate already exists
        let { data: candidateData, error: fetchError } = await supabase
          .from("voteCountManage")
          .select(userCourse)
          .eq("candidateVoteName", candidateID)
          .single();

        if (fetchError && fetchError.code === "PGRST116") {
          // No row found, so insert a new row with initial count 1 for the user's course
          const { error: insertError } = await supabase
            .from("voteCountManage")
            .insert({
              candidateVoteName: candidateID,
              [userCourse]: 1,
            });

          if (insertError) {
            console.error("Error inserting new vote count:", insertError);
            alert("Failed to submit vote. Please try again.");
            return;
          }
        } else if (candidateData) {
          // Row exists, so increment the count
          const currentCount = candidateData[userCourse] || 0;
          const updatedCount = currentCount + 1;

          const { error: updateError } = await supabase
            .from("voteCountManage")
            .update({ [userCourse]: updatedCount })
            .eq("candidateVoteName", candidateID);

          if (updateError) {
            console.error("Error updating vote count:", updateError);
            alert("Failed to submit vote. Please try again.");
            return;
          }
        }
      }

      // Update the user's vote status
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("users")
          .update({ voteStatus: "voted" })
          .eq("studentNumber", user.email.split("@")[0]);

        if (error) {
          console.error("Error updating vote status:", error.message);
          alert("Failed to submit vote. Please try again.");
          return;
        }

        alert("Vote submitted successfully!");
        navigate("/thank-you");
      }
    } catch (err) {
      console.error("Unexpected error during vote submission:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Group candidates by position
  const groupedCandidates = candidates.reduce((acc, candidate) => {
    acc[candidate.position] = acc[candidate.position] || [];
    acc[candidate.position].push(candidate);
    return acc;
  }, {});

  return (
    <div className=" votePage">
      <div className="listContainer ">
        <div>
          <h2 className="topLabel votePageLabel">CANDIDATES</h2>
        </div>
        {Object.keys(groupedCandidates).map((position) => (
          <div key={position}>
            <h3 className="position votePageLabel">
              {position
                .replace(/([A-Z])/g, " $1")
                .trim()
                .toUpperCase()}
            </h3>
            <div className="profileContainer">
              {groupedCandidates[position].map((candidate) => {
                const isSelected =
                  selectedCandidates[position] === candidate.candidateID;
                return (
                  <div
                    key={candidate.candidateID}
                    className={`candidate ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      handleCandidateSelect(position, candidate.candidateID)
                    }
                  >
                    <div className="profileRow">
                      <AvatarComponent
                        imgStyle={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "10px",
                          position: "relative",
                        }}
                        imgSrc={candidate.avatarUrl}
                      />
                      {isSelected && (
                        <div className="overlay">
                          <span className="overlayText">VOTED</span>
                        </div>
                      )}
                    </div>
                    <div className="candidateName votePageLabel">
                      <p>{candidate.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="submit">
          <Button
            className="submitBtn"
            type="button"
            variant="contained"
            sx={{
              backgroundColor: "#1ab394",
              marginTop: "10px",
            }}
            onClick={handleSubmitVote}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VotePage;
