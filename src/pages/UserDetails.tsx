import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BadgeCheck, BookmarkIcon } from "lucide-react"

export default function UserDetails() {
    return (
        <div className="container mx-auto px-4 sm:px-8 h-fit max-w-7xl ">
            <div className="flex flex-col w-full">
                <div className="flex items-center gap-8">
                    <Avatar className="sm:w-50 sm:h-50 w-35 h-35">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <h1 className="font-extrabold text-4xl tracking-wide">John Doe</h1>
                        <p className="font-semibold">Social Credit: 800</p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <Badge variant="secondary" className="px-4 py-2">
                                <BadgeCheck data-icon="inline-start" />
                                Verified
                            </Badge>
                            <Badge variant="outline" className="px-4 py-2">
                                Bookmark
                                <BookmarkIcon data-icon="inline-end" />
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
