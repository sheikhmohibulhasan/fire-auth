import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
firebase.initializeApp(firebaseConfig);

function App() {
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    password: ''
  });

  const provider = new firebase.auth.GoogleAuthProvider();
  const handleSignIn = () =>{
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      const {displayName, photoURL, email} = res.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser);
      console.log(displayName, email, photoURL);
    })
    .catch(error => {
      console.log(error.message);
    });
  };

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser = {
        isSignedIn: false,
        name: '',
        photo: '',
        email: '',
        password: '',
        isValid : true,
        error: ''
      }
      setUser(signedOutUser);
    })
    .catch(error => {
      console.log(error.message);
    })
  }

  const is_valid_email = email => email.length < 256 && /^[^@]+@[^@]{2,}\.[^@]{2,}$/.test(email); 
  const hasNumber = input => /\d/.test(input);

  const handleChange = event =>{
    const newUserInfo = {
      ...user
    };
    
    // Perform validation
    let isValid = true;
    if(event.target.name === 'email'){
      isValid = is_valid_email(event.target.value);
    }
    if(event.target.name === 'password'){
      isValid = event.target.value.length > 8 && hasNumber(event.target.value);
    }
    newUserInfo[event.target.name] = event.target.value;
    newUserInfo.isValid = isValid;
    setUser(newUserInfo);
  }
  const createAccount = (event) => {
    if(user.isValid){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res => {
        console.log(res);
        const createdUser = {...user};
        createdUser.isSignedIn = true;
        createdUser.error = '';
        setUser(createdUser);
      })
      .catch(error => {
        console.log(error.message);
        const createdUser = {...user};
        createdUser.isSignedIn = false;
        createdUser.error = error.message;
        setUser(createdUser);
      })
    }
    else{
      console.log('Form is not valid',user);
    }
    event.preventDefault();
    event.target.reset();
  }

  return (
    <div className="App">
      {
      user.isSignedIn ? <button onClick = {handleSignOut}>Sign Out</button> : 
      <button onClick = {handleSignIn}>Sign in</button>
      }
      {
        user.isSignedIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt=""/>
        </div>
      }
      <h1>Our own Authentication</h1>
      <form onSubmit={createAccount}>
        <input type="text" onBlur={handleChange} name='name' placeholder='Your Name' required/>
        <br/>
        <input type="text" onBlur={handleChange} name='email' placeholder='Your email' required/>
        <br/>
        <input type="password" onBlur={handleChange} name='password' placeholder='Your Password' required/>
        <br/>
        <input type="submit" value="Create Account"/>
      </form>
      {
        user.error && <p style={{color:'red'}}>{user.error}</p>
      }
    </div>
  );
}

export default App;
