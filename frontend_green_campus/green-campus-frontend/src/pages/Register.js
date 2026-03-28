import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { dashboardCopy } from "../config/dashboardConfig";

function Register() {

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [message,setMessage] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try{
      await registerUser(username, password);
        setMessage(dashboardCopy.auth.registerSuccess);

        setTimeout(()=>{
          navigate("/");
        },1500);
    }catch(error){
      setMessage(error.message || dashboardCopy.auth.registerServerError);
    }

  };

  return (

    <div style={styles.container}>

      <h2>{dashboardCopy.auth.registerTitle}</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleRegister} style={styles.button}>
        Register
      </button>

      <p style={{marginTop:"10px"}}>{message}</p>

      <p style={{marginTop:"20px"}}>
        {dashboardCopy.auth.alreadyHaveAccountText}{" "}
        <span
          onClick={()=>navigate("/")}
          style={{color:"blue",cursor:"pointer"}}
        >
          {dashboardCopy.auth.registerLoginLink}
        </span>
      </p>

    </div>

  );

}

const styles = {

  container:{
    width:"320px",
    margin:"120px auto",
    textAlign:"center",
    padding:"30px",
    background:"#ffffff",
    borderRadius:"12px",
    boxShadow:"0 4px 12px rgba(0,0,0,0.1)"
  },

  input:{
    display:"block",
    width:"100%",
    padding:"10px",
    margin:"12px 0",
    borderRadius:"6px",
    border:"1px solid #ccc"
  },

  button:{
    padding:"10px 20px",
    background:"#2ecc71",
    color:"#fff",
    border:"none",
    borderRadius:"6px",
    cursor:"pointer"
  }

};

export default Register;
