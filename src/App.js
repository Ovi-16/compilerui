import logo from './logo.svg';
import './App.css';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React,{useState} from 'react';
import {runtime} from "./compiler/compiler"
function App() {
  const [text,setText]=useState("")
  const [result,setResult]=useState([])
  const runCode=async()=>{
    const src=text
    
    const res=await runtime(src)
    console.log(res)
    setResult(res)
  }
  return (
    <div className="App">
      <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1, width: '80%' }, display: "flex",
      flexDirection: "column", // Ensures vertical stacking
       // Centers content vertically
      alignItems: "center", // Centers content horizontally
      height: "100vh",}}
      noValidate
      autoComplete="off"
      
    >
      <Stack spacing={5} direction="column"sx={{ width: "80%" ,alignItems: "center" }}>
      <TextField
          id="outlined-textarea"
          label="Enter Code"
          placeholder="Enter Code"
          sx={{width:"80%"}}
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
        />
       
      <Button variant="contained" color="success" sx={{ width: "20%" }} onClick={runCode}>
        Success
      </Button>
      <Box
      sx={{
        backgroundColor: "black",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        width: "100%",
        minHeight: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        flexDirection: "column",
      }}
    >{result.map((r)=>{
      return <Typography variant="body1">{r}</Typography>
})}
      
    </Box>
      </Stack>
        </Box>
    </div>
  );
}

export default App;
