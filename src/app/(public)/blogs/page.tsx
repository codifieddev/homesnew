import { ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Insights — Homes Real Estate Advisory",
  description:
    "Real estate market insights, investment guides, and property buying tips for Lucknow and Uttar Pradesh.",
};

const PLACEHOLDER_POSTS = [
  {
    category: "Market Insight",
    title: "Sushant Golf City: Why It Remains Lucknow's Most Sought-After Address in 2025",
    excerpt: "A deep dive into the infrastructure growth, appreciation trends, and upcoming developments that continue to make SGC the benchmark for premium residential investment in Lucknow.",
    readTime: "5 min read",
    date: "March 2025",
  },
  {
    category: "Buyer's Guide",
    title: "RERA Compliance in Uttar Pradesh: What Every Property Buyer Must Verify",
    excerpt: "Step-by-step guide to using the UP-RERA portal to verify project registrations, check developer credentials, and understand your legal rights before booking.",
    readTime: "7 min read",
    date: "February 2025",
  },
  {
    category: "Investment",
    title: "Residential Plots vs Apartments: Which is the Better Investment in Lucknow Right Now?",
    excerpt: "Comparing appreciation potential, liquidity, rental yield, and holding costs between plotted developments and apartment projects across Lucknow's key corridors.",
    readTime: "6 min read",
    date: "January 2025",
  },
  {
    category: "Home Loans",
    title: "How to Get Your Home Loan Approved Faster: A Practical Checklist",
    excerpt: "The most common reasons home loan applications get delayed or rejected — and what you can do before you apply to maximise approval speed and get the best rates.",
    readTime: "4 min read",
    date: "December 2024",
  },
  {
    category: "Legal Guide",
    title: "Stamp Duty and Registration Charges in UP: Everything Updated for 2025",
    excerpt: "Current rates, calculation method, concessions for women buyers, and the exact documentation you'll need at the sub-registrar office explained in plain language.",
    readTime: "5 min read",
    date: "November 2024",
  },
  {
    category: "Neighbourhood",
    title: "Sultanpur Road Corridor: Lucknow's Next Big Real Estate Growth Zone",
    excerpt: "How IT city development, the new ring road, and upcoming metro connectivity are reshaping property values along the Sultanpur Road axis.",
    readTime: "6 min read",
    date: "October 2024",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Market Insight": "bg-primary/10 text-primary border-primary/20",
  "Buyer's Guide":  "bg-secondary/10 text-secondary border-secondary/20",
  "Investment":     "bg-accent text-foreground border-border",
  "Home Loans":     "bg-primary-pale text-primary border-primary/25",
  "Legal Guide":    "bg-accent text-foreground border-border",
  "Neighbourhood":  "bg-secondary/10 text-secondary border-secondary/20",
};

export default function BlogsPage() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-px bg-primary" />
            <span className="text-xs text-primary uppercase tracking-widest font-medium">Insights</span>
          </div>
          <h1 className="mb-4 font-serif text-5xl font-medium text-foreground">Blogs & Market Insights</h1>
          <p className="leading-relaxed text-muted-foreground">
            Property buying guides, market analysis, and investment insights for Lucknow and Uttar Pradesh real estate — written by our advisory team.
          </p>
        </div>

        {/* Featured post */}
        <div className="bg-card border border-border hover:border-primary/20 rounded-2xl p-8 mb-8 transition-all group cursor-pointer">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS["Market Insight"]}`}>
                  Featured · Market Insight
                </span>
                <span className="text-xs text-muted-foreground">March 2025 · 5 min read</span>
              </div>
              <h2 className="mb-3 font-serif text-2xl font-medium text-foreground transition-colors group-hover:text-primary-light">
                {PLACEHOLDER_POSTS[0].title}
              </h2>
              <p className="leading-relaxed text-muted-foreground">{PLACEHOLDER_POSTS[0].excerpt}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary group-hover:text-primary-light transition-colors flex-shrink-0 mt-4">
              Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PLACEHOLDER_POSTS.slice(1).map((post) => (
            <div
              key={post.title}
              className="group bg-card border border-border hover:border-primary/20 rounded-2xl p-6 transition-all cursor-pointer flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[post.category] ?? "bg-accent text-muted-foreground border-border"}`}>
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">{post.readTime}</span>
              </div>
              <h3 className="mb-3 flex-1 line-clamp-2 font-serif text-lg font-medium text-foreground transition-colors group-hover:text-primary-light">
                {post.title}
              </h3>
              <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <span className="flex items-center gap-1.5 text-xs text-primary group-hover:text-primary-light transition-colors">
                  Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CMS notice */}
        <div className="mt-14 bg-primary/5 border border-primary/15 rounded-2xl p-6 flex items-start gap-4">
          <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Blog content is static for now</p>
            <p className="text-sm text-muted-foreground">
              A full CMS integration (Contentlayer, Sanity, or a <code className="text-primary bg-accent px-1.5 py-0.5 rounded">posts</code> MongoDB collection) can be added in a future phase to enable dynamic publishing directly from the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
