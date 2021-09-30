import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import PostFeed from '../../components/PostFeed';
import { UserContext } from '../../lib/context';
import { firestore, auth, serverTimestamp } from '../../lib/firebase';

import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function AdminPostsPage() {
  return (
    <main>
      <AuthCheck>
        <CreateNewMeeting />
        <MeetingList />
      </AuthCheck>
    </main>
  );
}

function MeetingList() {

  const [value, onChange] = useState(new Date());
  const [filter, setFilter] = useState(false);

  let ref;
  if(auth.currentUser)
     ref = firestore.collection('users').doc(auth.currentUser.uid).collection('posts');

  const query = ref.orderBy('createdAt', 'desc');
  const [querySnapshot, loading] = useCollection(query);
  const [dposts, setdposts] = useState([]);

  if(!auth.currentUser) {
    return <h3> Thank You for using ! Please return again</h3>
  }

  if(loading)
    return null;

  const posts = querySnapshot?.docs?.map((doc) => doc.data());

  function modify_dposts() {

    Date.prototype.withoutTime = function () {
      var d = new Date(this);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    setdposts(
      querySnapshot?.docs?.map((doc) => doc.data()).filter((post, i) => {

        const startTimeDate = new Date(post.startTime).withoutTime();
        const endTimeDate = new Date(post.endTime).withoutTime();
        const pickedTimeDate = value.withoutTime()

        return (startTimeDate <= pickedTimeDate) && (pickedTimeDate <= endTimeDate);
      })
    );
    // console.log({dposts, posts});
  }

  return (
    <>
      <h1>Manage your Meetings </h1>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Calendar
          onChange={ (e) => { onChange(e); modify_dposts(); setFilter(true); } }
          value={value}
        />
      </div>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <button onClick={() => {setFilter(false); }}> Show all meetings </button>
      </div>
      {
        filter && <PostFeed posts={dposts} admin />
      }
      {
        !filter && <PostFeed posts={posts} admin />
      }

    </>
  );
}

function CreateNewMeeting() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = firestore.collection('users').doc(uid).collection('posts').doc(slug);

    // Tip: give all fields a default value here
    const data = {
      title,
      slug,
      uid,
      username,
      content: 'Meeting description',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      startTime: String(new Date()),
      endTime: String(new Date()),
    };

    await ref.set(data);

    toast.success('Meeting added !');

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Meeting !"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Meeting
      </button>
    </form>
  );
}