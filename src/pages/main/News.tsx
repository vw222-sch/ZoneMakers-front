import { useState, useEffect, useRef } from 'react';
import NewsCard from '@/components/shared/NewsCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CircleAlertIcon, TriangleAlertIcon, Loader2 } from "lucide-react"
import { cn } from '@/lib/utils';

interface NewsArticle {
    id: number;
    title: string;
    text: string;
    summary: string;
    url: string;
    image: string;
    publish_date: string;
    source_country: string;
}

interface NewsResponse {
    news: NewsArticle[];
}

const CATEGORIES = [
    {
        id: "conflicts",
        label: "Conflicts & War",
        query: "war OR conflict OR airstrike OR NATO OR Ukraine OR ceasefire OR protest OR coup",
    },
    {
        id: "crime",
        label: "Crime & Violence",
        query: "crime OR terrorism OR stabbing OR shooting OR attack",
    },
    {
        id: "advisory",
        label: "Travel Advisories",
        query: "travel advisory OR travel warning OR travel ban",
    },
    {
        id: "disasters",
        label: "Disasters & Emergencies",
        query: "disaster OR emergency OR collapse OR wildfire OR explosion OR pandemic",
    },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface CacheEntry {
    articles: NewsArticle[];
    offset: number;
}

export default function News() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [activeCategory, setActiveCategory] = useState<CategoryId>("conflicts");

    const cache = useRef<Partial<Record<CategoryId, CacheEntry>>>({});
    const abortControllerRef = useRef<AbortController | null>(null);

    const LIMIT = 9;
    const apiKey = import.meta.env.VITE_WORLD_NEWS_API_KEY || '';

    const fetchNews = async (currentOffset: number, categoryId: CategoryId, isLoadMore = false) => {
        if (!isLoadMore && cache.current[categoryId]) {
            const cached = cache.current[categoryId]!;
            setNews(cached.articles);
            setOffset(cached.offset);
            setIsLoading(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        if (!isLoadMore) setError(null);

        const category = CATEGORIES.find((c) => c.id === categoryId)!;
        const url = `https://api.worldnewsapi.com/search-news?text=${encodeURIComponent(category.query)}&language=en&offset=${currentOffset}&number=${LIMIT}&sort=publish-time&sort-direction=DESC`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-api-key': apiKey },
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: NewsResponse = await response.json();

            setNews((prev) => {
                const updated = isLoadMore ? [...prev, ...data.news] : data.news;

                cache.current[categoryId] = { articles: updated, offset: currentOffset };
                return updated;
            });

            setOffset(currentOffset);

        } catch (err: any) {
            if (err.name === 'AbortError') return;
            setError(err.message || "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(0, activeCategory, false);

        return () => abortControllerRef.current?.abort();
    }, [activeCategory]);

    return (
        <div className="container mx-auto max-w-6xl px-4 min-h-screen pb-12">
            <h1 className="fl-text-4xl/6xl font-bold tracking-widest text-center my-16">
                Travel Safety News
            </h1>

            <div className="mb-10">
                <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase mb-3">
                    Filter by topic
                </p>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            disabled={isLoading}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 cursor-pointer",
                                activeCategory === category.id
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black"
                            )}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <Alert className='bg-destructive dark:bg-destructive/60 border-none text-white'>
                    <TriangleAlertIcon className="h-5! w-5! text-white" />
                    <AlertTitle className='font-bold tracking-wide'>Failed to load news</AlertTitle>
                    <AlertDescription className='text-white/80'>Please try again or reload the page.</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((article, index) => (
                    <NewsCard
                        key={`${article.id}-${index}`}
                        image={article.image}
                        title={article.title}
                        description={article.summary || article.text}
                        url={article.url}
                        publishDate={article.publish_date}
                        sourceCountry={article.source_country}
                    />
                ))}
            </div>

            {!isLoading && !error && news.length === 0 && (
                <Alert className='border-none bg-sky-600 text-white dark:bg-sky-400'>
                    <CircleAlertIcon className="h-5! w-5! text-white" />
                    <AlertTitle className='font-bold tracking-wide'>No articles found for this topic.</AlertTitle>
                    <AlertDescription className='text-white/80'>Please try selecting a different category or check back later for updates.</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col items-center justify-center mt-12 h-16">
                {isLoading && news.length === 0 ? (
                    <p className="text-center fl-text-2xl/4xl animate-pulse font-bold">
                        Fetching alerts...
                    </p>
                ) : (
                    news.length > 0 && (
                        <Button
                            onClick={() => fetchNews(offset + LIMIT, activeCategory, true)}
                            disabled={isLoading}
                            className="font-bold px-8 py-6 rounded-full cursor-pointer fl-text-sm/base"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Loading more...
                                </>
                            ) : (
                                "Load More News"
                            )}
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}