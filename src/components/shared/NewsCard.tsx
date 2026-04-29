import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { ImageOff } from 'lucide-react';

interface NewsCardProps {
    title: string;
    image: string;
    description: string;
    url: string;
    publishDate: string;
    sourceCountry: string;
}

export default function NewsCard({ title, image, description, url, publishDate, sourceCountry }: NewsCardProps) {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(publishDate));

    return (
        <Card className="flex flex-col h-full max-w-sm overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 pt-0">
            {image ? (
                <img
                    src={image}
                    alt={title}
                    loading="lazy"
                    className="w-full aspect-video object-cover shrink-0"
                />
            ) : (
                <div className="w-full aspect-video shrink-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
                    <ImageOff className="h-10 w-10 mb-2 opacity-50" strokeWidth={1.5} />
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-60">
                        No Image
                    </span>
                </div>
            )}

            <CardHeader className="flex-1 space-y-2 pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {sourceCountry && <span>{sourceCountry}</span>}
                    {sourceCountry && publishDate && <span>•</span>}
                    {publishDate && <time dateTime={publishDate}>{formattedDate}</time>}
                </div>

                <CardTitle className="line-clamp-2 leading-snug font-bold">
                    {title}
                </CardTitle>

                <CardDescription className="line-clamp-3 text-pretty text-sm">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardFooter>
                <Button asChild className="w-full font-bold tracking-widest cursor-pointer">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        Read article
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}