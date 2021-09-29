import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import { firestore, auth, serverTimestamp } from '../../lib/firebase';
import { useRouter } from 'next/router';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AdminPostEdit() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {

  const router = useRouter();
  const { slug } = router.query;

  const postRef = firestore.collection('users').doc(auth.currentUser.uid).collection('posts').doc(slug);
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} defaultValues={post} />
          </section>
        </>
      )}
    </main>
  );
}

function PostForm({ defaultValues, postRef }) {

  const [value, onChange] = useState(new Date(defaultValues.startTime.toString()));
  const [value2, onChange2] = useState(new Date(defaultValues.endTime.toString()));

  const { register, errors, handleSubmit, formState, reset } = useForm({ defaultValues, mode: 'onChange' });

  const { isValid } = formState;

  const updatePost = async ({ content }) => {

    try {

      await postRef.update({
        startTime: value.toString(),
        endTime: value2.toString(),
        content,
        updatedAt: serverTimestamp(),
      });

    } catch(e) {
      return;
    }

    reset({ content });

    toast.success('Meeting updated successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>

      <div className={styles.controls}>

        <textarea
          name="content"
          ref={register({
            maxLength: { value: 200, message: 'content is too long' },
            minLength: { value: 5, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}
        ></textarea>

        {errors.content && <p className="text-danger">{errors.content.message}</p>}

        <h3> Start Date : </h3>
        <DatePicker
        selected={value}
        onChange={onChange}
        />

        <h3> End Date : </h3>
        <DatePicker
        selected={value2}
        onChange={onChange2}
        />

        <div className={styles.controlBtns}>

          <button type="submit" className="btn-green" disabled={!isValid}>
            Save Changes
          </button>

          <DeletePostButton postRef={postRef} />
        </div>

      </div>
    </form>
  );
}

function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('Are you sure ? ');
    if (doIt) {
      try {
        await postRef.delete();
      } catch(e) {
        console.log(e);
      }
      router.push('/admin');
      toast('Meeting removed ! ', { icon: '🗑️' });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}