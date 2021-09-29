import Link from "next/link";


export default function PostFeed({ posts }) {
  return posts?.map((post) => <PostItem post={post} key={post.slug} />) || null;
}

function PostItem({ post }) {
  return (
    <div className='card'>

      <a>
        <strong> @{post.username} </strong>
      </a>

      <h2 style={{display: 'flex', justifyContent: 'space-between'}}>
        <span> {post.title} </span>
        <span>
          {/* Timings &nbsp;&nbsp;&nbsp; - &nbsp;&nbsp;&nbsp; */}
          <i> {new Date(post.startTime).toLocaleDateString("en-US")} - {new Date(post.endTime).toLocaleDateString("en-US")} </i>
        </span>
      </h2>

      <p>
        {post.content}
      </p>


      <Link href={`/admin/${post.slug}`}>
        <h3>
          <button className="btn-blue">Edit</button>
        </h3>
      </Link>

    </div>
  );

}