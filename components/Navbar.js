import Link from 'next/link';
import { UserContext } from '../lib/context';
import { useContext } from 'react';
import { auth } from '../lib/firebase';

export default function Navbar() {

  const { user, username } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/">
            <button className="btn-logo"> MEETS </button>
          </Link>
        </li>

        {username && (
          <>
            <li className="push-left">
              <Link href="/admin">
                <button className="btn-blue"> Add Listing </button>
              </Link>
            </li>

            <li>
              <button onClick={() => auth.signOut()}>Sign Out</button>
            </li>

            <li>
              <Link href={`/admin`}>
                <img src={auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1573547429441-d7ef62e04b63?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fGFub255bW91c3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80'} />
              </Link>
            </li>

          </>
        )}


        {!username && (
          <>
            <li>
              <Link href="/enter">
                <button className="btn-blue"> {user ? 'Create Username' : 'Sign In'} </button>
              </Link>
            </li>

          </>
        )}

      </ul>
    </nav>
  )
}
