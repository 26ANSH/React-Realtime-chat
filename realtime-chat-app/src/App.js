import React, { useRef, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'
import signup from './images/signup.svg';
import googleLogo from './images/googleLogo.svg';

firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
})


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() 
{
  const [user] = useAuthState(auth);

  return (
    <div className="font-mono">
      <header className="">

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

      </header>
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className="flex flex-col md:flex-row justify-center">

      <div className="w-full h-full lg:w-1/2 lg:h-1/2">
        <img src={signup} alt="Sign up logo" />
      </div>

      <div className="w-full h-full lg:w-1/2 lg:h-1/2 m-auto">
        <button className="m-auto border-2 border-yellow-400 rounded-md justify-between flex px-8 py-2" onClick={signInWithGoogle}><img className="px-2" src={googleLogo} alt="Sign up logo" /> Sign in with Google </button>
      </div>

    </div>
  )

}

function ChatRoom()
{
  const dummy = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(50);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => 
  {
    setFormValue('');

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    dummy.current.scrollIntoView({ behavior: 'smooth' });

  }

  return(
    <section>
    <div className="px-4 mb-24 mt-4">
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      <span ref={dummy}></span>
    </div>

      <form onSubmit={sendMessage} className="bg-white p-4 mx-auto dark:bg-gray-900 fixed w-full bottom-0 z-10">

       <input className="p-2 w-4/5 m-2 rounded-md border-2 border-yellow-700 bg-yellow-100" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send your Message" />

        <button type="submit" className="rounded-full py-2 px-4 m-2 bg-green-700 text-white" disabled={!formValue}>🕊️</button>

        <button className="py-2 px-4 bg-yellow-800 rounded-full text-white" onClick={() => auth.signOut()}>Sign Out</button>
      </form>

    </section>
  )

}

function ChatMessage(props) 
{
  const { text, uid, photoURL } = props.message;

  const sent = uid === auth.currentUser.uid ? true : false;

  if(sent)
  {
    // Message Sent
    return (<>
      <div className=" ml-12 flex flex-row-reverse">
        <img className="rounded-full h-8 ml-2" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Profile"/>
        <p className="bg-green-100 my-2 py-2 px-8 rounded-l-full rounded-br-full">{text}</p>
      </div>
    </>)
  }
  else
  {
    // Message Recieved
    return (<>
      <div className="mr-12 flex">
        <img className="rounded-full h-8 mr-2" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Profile"/>
        <p className="bg-red-100 my-2 py-2 px-8 rounded-r-full rounded-bl-full">{text}</p>
      </div>
    </>)
  }

}

export default App;
