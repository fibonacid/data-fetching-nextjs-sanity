import sanityClient from "@sanity/client";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { Page } from "../../types";

// Configure Sanity client
const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2022-11-26",
  // Since we are using getStaticProps, using the CDN is redundant, therefore we disable it.
  useCdn: false,
  // Since we don't rely on the CDN, the dataset can be private.
  token: process.env.SANITY_API_TOKEN,
});

export async function getStaticProps(
  ctx: GetStaticPropsContext<{ slug: string }>
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
    // Since dataset might be private, we need to check for published documents.
    `*[_type == "page" && slug.current == $slug && !(_id in path("drafts.**"))][0]`,
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
    // Revalidate the page every minute
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  // Fetch all pages from Sanity
  const pages = (await client.fetch(
    `*[_type == "page" && defined(slug.current) && !(_id in path("drafts.**"))]`
  )) as Page[];
  // Return the paths as an array of strings
  return {
    paths: pages.map((page) => ({ params: { slug: page.slug.current } })),
    // Fallback: blocking means that if a page is not in the paths array, it will be generated on the fly.
    fallback: "blocking",
  };
}

export default function ISRPage(
  // Infer page props type from the return value of getServerSideProps
  props: InferGetStaticPropsType<typeof getStaticProps>
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
