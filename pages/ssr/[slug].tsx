import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import sanityClient from "@sanity/client";
import { Page } from "../../types";

// Configure Sanity client
const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  // Since we are using getServerSideProps, using the CDN will save us money.
  // ⚠️ Using the CDN will require the dataset to be public.
  useCdn: true,
});

export async function getServerSideProps(
  ctx: GetServerSidePropsContext<{ slug: string }>
) {
  // Get the slug from the URL
  if (!ctx.params?.slug) {
    // If there is no slug, show a 404 page
    return {
      notFound: true,
    };
  }
  // Fetch page data from Sanity.
  const page = (await client.fetch(
    // Since dataset is private, we don't need to check for published documents.
    `*[_type == "page" && slug.current == $slug][0]`,
    { slug: ctx.params.slug }
  )) as Page | null;
  // If there is no page, show a 404 page
  if (!page) {
    return {
      notFound: true,
    };
  }
  // Return the page data as props
  return {
    props: {
      page,
      timestamp: new Date().toISOString(),
    },
  };
}

export default function SSRPage(
  // Infer page props type from the return value of getServerSideProps
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const generatedAt = new Date(props.timestamp).toLocaleString();
  const updatedAt = new Date(props.page._updatedAt).toLocaleString();

  return (
    <main>
      <h1>{props.page.title}</h1>
      <p>{props.page.body}</p>
      <footer>
        Published at: <time>{updatedAt}</time>
        <br />
        Generated at: <time>{generatedAt}</time>
      </footer>
    </main>
  );
}
