import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

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

export default function News() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState<number>(0);

    const LIMIT = 9;
    const apiKey = import.meta.env.VITE_WORLD_NEWS_API_KEY || '';

    const fetchNews = useCallback(async (currentOffset: number) => {
        setIsLoading(true);
        setError(null);

        const searchQuery = '(travel OR tourism) AND (warning OR danger OR alert OR advisory OR safety)';
        const encodedQuery = encodeURIComponent(searchQuery);

        const url = `https://api.worldnewsapi.com/search-news?text=${encodedQuery}&language=en&offset=${currentOffset}&number=${LIMIT}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-api-key': apiKey }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data: NewsResponse = await response.json();

            setNews((prevNews) =>
                currentOffset === 0 ? data.news : [...prevNews, ...data.news]
            );
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    }, [apiKey]);

    useEffect(() => {
        fetchNews(0);
    }, [fetchNews]);

    const handleLoadMore = () => {
        const nextOffset = offset + LIMIT;
        setOffset(nextOffset);
        fetchNews(nextOffset);
    };

    return (
        <div className="container mx-auto max-w-6xl px-4 min-h-screen pb-12">
            <h1 className="fl-text-4xl/6xl font-bold tracking-widest text-center my-16">
                Daily News
            </h1>

            {error && (
                <p className="text-center text-red-500 fl-text-2xl/4xl mb-8 font-bold tracking-wider">
                    Failed to load news: {error}
                </p>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {news.map((article, index) => (
                    <div
                        key={`${article.id}-${index}`}
                        className="rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 border-2 border-black"
                    >
                        {article.image ? (
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-48 object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">No Image</span>
                            </div>
                        )}

                        <div className="p-6 flex flex-col grow">
                            <h2 className="text-xl font-bold mb-4 line-clamp-2 text-gray-800">
                                {article.title}
                            </h2>
                            <p className="text-sm font-semibold mb-4 text-gray-500">
                                {new Date(article.publish_date).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 mb-8 line-clamp-3 grow">
                                {article.summary || article.text}
                            </p>

                            <Button
                                asChild
                                className='fl-text-sm/base font-bold tracking-widest cursor-pointer w-full'
                                size='lg'
                            >
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Read Article
                                </a>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center justify-center mt-12 h-16">
                {isLoading ? (
                    <p className="text-center fl-text-2xl/4xl animate-pulse font-bold">
                        Fetching more alerts...
                    </p>
                ) : (
                    news.length > 0 && (
                        <Button
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className='font-bold px-8 py-6 rounded-full cursor-pointer fl-text-sm/base'
                        >
                            Load More News
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}