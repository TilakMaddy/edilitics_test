export async function getServerSideProps() {

  return {
    redirect: {
      destination: '/admin',
      permanent: true,
    },
  }

}

export default function HomePage() {
  return <p>...</p>;
}

