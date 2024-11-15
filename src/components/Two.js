import React, { useState } from "react";
import "../App.css";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { supabase } from "./client";

function Two() {
  const [positions, setPositions] = useState([]);
  const [positionInput, setPositionInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const fetchPositions = async () => {
    const { data, error } = await supabase.from("positions").select("*");
    if (error) {
      console.error("Error fetching positions:", error);
      return;
    }
    setPositions(data.map((pos) => pos.positions));
  };

  const handleAddPosition = async () => {
    if (!positionInput) return;

    if (editIndex !== null) {
      const updatedPositions = positions.map((pos, index) =>
        index === editIndex ? positionInput : pos
      );
      setPositions(updatedPositions);
      const { error } = await supabase
        .from("positions")
        .update({ positions: positionInput })
        .eq("positions", positions[editIndex]);
      if (error) console.error("Error updating position:", error);
      setEditIndex(null);
    } else {
      // Add new position
      const { error } = await supabase
        .from("positions")
        .insert([{ positions: positionInput }]);
      if (error) {
        console.error("Error adding position:", error);
        return;
      }
      setPositions([...positions, positionInput]);
    }
    setPositionInput("");
    fetchPositions();
  };

  const handleDeletePosition = async (index) => {
    const { error } = await supabase
      .from("positions")
      .delete()
      .eq("positions", positions[index]);
    if (error) {
      console.error("Error deleting position:", error);
      return;
    }
    const filteredPositions = positions.filter((_, i) => i !== index);
    setPositions(filteredPositions);
  };

  const handleEditPosition = (index) => {
    setPositionInput(positions[index]);
    setEditIndex(index);
  };

  React.useEffect(() => {
    fetchPositions();
  }, []);

  return (
    <div className="homeRow">
      <div className="navSpace"></div>
      <div className="homeContainer ">
        <div className="listContainer positionForm">
          <label className="topLabel">POSITION FORM</label>
          <Box
            className="positionInput"
            component="form"
            noValidate
            autoComplete="off"
          >
            <div className="inputField">
              <TextField
                label="Add Position"
                id="outlined-size-small"
                size="small"
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPosition();
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#1ab394",
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      borderRight: 0,
                    },
                    "&:hover fieldset": {
                      borderColor: "#1ab394",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1ab394",
                    },
                  },
                }}
              />
              <Stack spacing={2} direction="row">
                <Button
                  variant="outlined"
                  className="btnAdd"
                  onClick={handleAddPosition}
                  sx={{
                    color: "#1ab394",
                    "&:hover": {
                      backgroundColor: "#1ab394",
                      color: "#fff",
                    },
                    borderColor: "#1ab394",
                  }}
                >
                  {editIndex !== null ? "✔" : "+"} {}
                </Button>
              </Stack>
            </div>
          </Box>
        </div>
        <div className="listContainer listTable">
          <table>
            <thead>
              <tr className="tableList">
                <th className="positionTabletext">POSITION</th>
                <th className="actionTable">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="tableContainer">
              {positions.map((position, index) => (
                <tr key={index} className="tableContent">
                  <hr />
                  <td className="positionTable">{position}</td>
                  <td className="actionTable">
                    <Button
                      variant="outlined"
                      sx={{ marginRight: 1 }}
                      onClick={() => handleEditPosition(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeletePosition(index)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Two;
