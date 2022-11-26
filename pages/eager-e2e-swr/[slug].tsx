import sanityClient from "@sanity/client";
import type { GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Page } from "../../types";

// Configure Sanity client
const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2022-11-26",
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
  return {
    // To demonstrate the fallback behavior, we don't return any paths here.
    paths: [],
    // Fallback: true means that pages that don't exist yet will generated in the background
    fallback: true,
  };
}

export default function EagerE2ESWR(
  // Infer page props type from the return value of getStaticProps
  // ⚠️ Since we use fallback: true, the page props might be undefined.
  props: Partial<InferGetStaticPropsType<typeof getStaticProps>>
) {
  const { query, isFallback } = useRouter();

  const slug = isFallback
    ? // If the page is still generating, use the slug from the URL
      Array.isArray(query.slug)
      ? query.slug[0]
      : query.slug
    : // If the page is generated, use the slug from props
      props.page?.slug.current;

  // Refetch the page data on the client
  const {
    data: page,
    isValidating,
    error,
  } = useSWR(slug, getPageBySlug, {
    // Pass the initial data only if it's not a fallback page.
    fallbackData: isFallback ? null : props.page,
  });

  if (page) {
    const generatedAt = new Date().toLocaleString();
    const updatedAt = new Date(page._updatedAt).toLocaleString();

    return (
      <main>
        <h1>{page.title}</h1>
        <p>{page.body}</p>
        <footer>
          Published at: <time>{updatedAt}</time>
          <br />
          Generated at: <time>{generatedAt}</time>
          {isValidating && <p>Updating...</p>}
          {error?.message && <p>Error: {error.message}</p>}
        </footer>
      </main>
    );
  } else if (error) {
    // Show error message if there is an error and no page data
    return <p>Error: {error.message}</p>;
  } else {
    // This will happen when the page has never been generated before
    return <p>Loading...</p>;
  }
}
