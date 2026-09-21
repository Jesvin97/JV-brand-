import { client } from "@/sanity/client";
import { defineQuery, PortableText, type SanityDocument } from "next-sanity";

const POSTS_QUERY = defineQuery(
  `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    _id,
    title,
    slug,
    category,
    readTime,
    excerpt,
    publishedAt,
    body
  }`
);

export default async function BlogPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, { next: { revalidate: 10 } });

  const categoryLabels: Record<string, string> = {
    branding: "Personal Branding",
    strategy: "Content Strategy",
    growth: "Client Acquisition",
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 pt-28 sm:pt-36 pb-20 font-sans text-slate-100 bg-slate-950 min-h-screen">
      {/* Hero Banner */}
      <section className="mb-12 text-center max-w-3xl mx-auto">
        <span className="text-xs text-orange-500 uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 font-semibold">
          Founder Strategy & Insights
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mt-4 mb-4 leading-tight text-white">
          Turn Attention Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Authority</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Strategic articles, content frameworks, and personal positioning blueprints managed via Sanity CMS.
        </p>
      </section>

      {/* Blog Grid */}
      {posts.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 max-w-lg mx-auto">
          No published posts yet. Log in to your Sanity Studio at <code className="text-orange-400">http://localhost:3333</code> to create your first article!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => {
            const catKey = (post.category as string) || "branding";
            const catLabel = categoryLabels[catKey] || catKey;
            const publishedDate = post.publishedAt
              ? new Date(post.publishedAt as string).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "Draft";

            return (
              <article key={post._id} className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-orange-500/20 flex flex-col justify-between hover:border-orange-500/50 transition-all duration-300">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20 font-semibold">
                      {catLabel}
                    </span>
                    {post.readTime && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        {post.readTime as string}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">{post.title as string}</h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {(post.excerpt as string) || "Read the full article strategy breakdown below."}
                  </p>
                  {Array.isArray(post.body) && (
                    <div className="prose prose-invert text-slate-300 text-xs sm:text-sm border-t border-slate-800 pt-4 mb-4">
                      <PortableText value={post.body} />
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{publishedDate}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
