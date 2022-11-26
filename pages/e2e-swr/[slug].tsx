import sanityClient from "@sanity/client";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { Page } from "../../types";
import useSWR from "swr";
import { useEffect } from "react";

// Configure Sanity client
const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  // Since we revalidate the page on the client, using the CDN will save us money.
  useCdn: true,
});

async function getPageBySlug(slug: string): Promise<Page | null> {
  // Add artificial delay to simulate slow network
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Fetch page data from Sanity.
  return client.fetch(
    // Since dataset might be private, we need to check for published documents.
    `*[_type == "page" && slug.current == $slug && !(_id in path("drafts.**"))][0]`,
    { slug }
  );
}

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
  const page = await getPageBySlug(ctx.params.slug);
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

export default function CSRPage(
  // Infer page props type from the return value of getServerSideProps
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  // Refetch the page data on the client
  const {
    data: page,
    isValidating,
    error,
  } = useSWR(props.page.slug.current, getPageBySlug, {
    fallbackData: props.page,
  });

  if (page) {
    const generatedAt = new Date(props.timestamp).toLocaleString();
    const updatedAt = new Date(page._updatedAt).toLocaleString();

    return (
      <main>
        <h1>{props.page.title}</h1>
        <p>{props.page.body}</p>
        <footer>
          Published at: <time>{updatedAt}</time>
          <br />
          Generated at: <time>{generatedAt}</time>
          {isValidating && <p>Updating...</p>}
          {error?.message && <p>Error: {error.message}</p>}
        </footer>
      </main>
    );
  } else {
    // This won't happen because we are using fallback: "blocking"
    return <p>Loading...</p>;
  }
}
