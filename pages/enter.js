import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useContext, useState, useEffect, useCallback } from "react";
import debounce from 'lodash.debounce';
import { UserContext } from "../lib/context";
import { auth, firestore, googleAuthProvider, firebaseAuthConfig } from "../lib/firebase";
import toast from "react-hot-toast";

export default function EnterPage({}) {

  const { user, username } = useContext(UserContext);

  /**
   * user is signed out ?
   *  - <SignInButton />
   *
   * user is signed in ?
   *  - user is missing username ?
   *     <UsernameForm/> (newly registered)
   *  - else:
   *     usrename <SignOutButton>
   */

  return (
    <main>
      {user?
        !username ? <UsernameForm /> : <SignOutButton />
        : <SignInButton />
      }
    </main>
  );
}

function SignInButton() {
  const signInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider)
  };
  return (
    <>
      <button onClick={ () => signInWithGoogle()} className="btn-google" style={{ margin: "0 auto 50px", width:"35%", minWidth:"300px"}}>
        <img src={'/g.jpeg'} /> Sign in with Google
      </button>
      <StyledFirebaseAuth
        uiConfig={firebaseAuthConfig}
        firebaseAuth={auth}
      />
    </>
  )
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>
}

function UsernameForm() {

  // Attached to the controlled input
  const [formValue, setFormValue] = useState('');

  // Username is not taken
  const [isValid, setIsValid] = useState(false);

  // Consulting the database ...
  const [isLoading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  const onChange = (e) => {

    // Force the form value typed to match the format
    const val = e.target.value.toLowerCase();
    const re = /^(?=[A-Za-z0-9_.]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // Only set the form value if length < 3 or it passes regex
    if(val.length < 3 || re.test(val)) {
      setFormValue(val);
      setIsValid(false);
      setLoading(false);
    }

    if(re.test(val)) {
      setLoading(true);
    }

  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  /*
    Hit the database for username match after each debounced change

    React requires deboucned functions to useCallback otherwise
    it'll cerate a new debounced function on every render which does
    not serve our purpose

  */

  const checkUsername = useCallback(
    debounce(async (username) => {
      if(username.length >= 3) {
        const ref = firestore.doc(`usernames/${username}`);
        const { exists } = await ref.get();
        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    // Create refs for both documents
    const userDoc = firestore.doc(`users/${user.uid}`);
    const usernameDoc = firestore.doc(`usernames/${formValue}`)

    //Commit both docs together as a batch write
    const batch = firestore.batch();
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL || "https://images.unsplash.com/photo-1573547429441-d7ef62e04b63?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fGFub255bW91c3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
      displayName: user.displayName || "Anonymous",
    });
    batch.set(usernameDoc, { uid: user.uid });

    try {
      await batch.commit();
    } catch(e) {
      toast.error('Could not complete the process');
    }

  };

  return (
    !username && (
      <section>

        <h3> Choose Username </h3>

        <form onSubmit={onSubmit}>

          <input type='text' name='username' placeholder='username' value={formValue} onChange={onChange} />

          <UsernameMessage username={formValue} isValid={isValid} loading={isLoading} />

          <button type='submit' className='btn-green' disabled={!isValid}>
            Choose
          </button>

          <h3> Debug State </h3>
          <div>
            Username : {formValue}
            <br />
            Loading: {isLoading}
            <br/>
            Username Valid: {isValid.toString()}
          </div>
        </form>

      </section>
    )
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if(loading) {
    return <p> Checking... </p>;
  }
  else if(isValid) {
    return <p className='text-success'>{username} is available !</p>;
  }
  else if (username && !isValid) {
    return <p className='text-danger'>That username is taken !</p>
  }
  else {
    return <p></p>
  }
}