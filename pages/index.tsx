import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Data fetching patterns for Next.js & Sanity</h1>
      <p>
        Read the{" "}
        <a href="https://dev.to/fibonacid/data-fetching-patterns-for-nextjs-sanity-4bgh">
          article
        </a>
      </p>
      <ul>
        <li>
          <Link href="/ssr/home">Server Side Rendering (SSR)</Link>
        </li>
        <li>
          <Link href="/isr/home">Incremental Static Regeneration (ISR)</Link>
        </li>
        <li>
          <Link href="/od-isr/home">On-Demand ISR</Link>
        </li>
        <li>
          <Link href="/isr-swr/home">ISR + Stale While Revalidate (SWR)</Link>
        </li>
      </ul>
    </main>
  );
}
