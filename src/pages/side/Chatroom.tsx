import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BadgeCheckIcon, SendIcon } from "lucide-react"
import { useNavigate } from "react-router"
import { useState } from "react"

const CURRENT_USER = "yourusername"

interface Reply {
    id: string
    author: string
    handle: string
    avatar: string
    text: string
    taggedUser?: string
}

interface Post {
    id: string
    author: string
    handle: string
    avatar: string
    verified: boolean
    title: string
    content: string
    image: string
    replies: Reply[]
}

const mockPosts: Post[] = [
    {
        id: "1",
        author: "John Doe",
        handle: "johndoe",
        avatar: "https://github.com/shadcn.png",
        verified: true,
        title: "France 🇫🇷",
        content:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae incidunt doloribus ducimus porro veritatis velit assumenda. Quidem alias, voluptatem blanditiis ullam maiores commodi repudiandae modi, cumque, enim earum saepe praesentium!",
        image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
        replies: [
            {
                id: "r1",
                author: "Jane Smith",
                handle: "janesmith",
                avatar: "https://github.com/shadcn.png",
                text: "@johndoe Great post!",
                taggedUser: "johndoe",
            },
        ],
    },
    {
        id: "2",
        author: "Alice Johnson",
        handle: "alice",
        avatar: "https://github.com/shadcn.png",
        verified: false,
        title: "Germany 🇩🇪",
        content:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae incidunt doloribus ducimus porro veritatis velit assumenda. Quidem alias, voluptatem blanditiis ullam maiores commodi repudiandae modi, cumque, enim earum saepe praesentium!",
        image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
        replies: [
            {
                id: "r2",
                author: "Bob Wilson",
                handle: "bob",
                avatar: "https://github.com/shadcn.png",
                text: "@yourusername You should visit too!",
                taggedUser: "yourusername",
            },
        ],
    },
    {
        id: "3",
        author: "Charlie Brown",
        handle: "charlie",
        avatar: "https://github.com/shadcn.png",
        verified: true,
        title: "Spain 🇪🇸",
        content:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae incidunt doloribus ducimus porro veritatis velit assumenda. Quidem alias, voluptatem blanditiis ullam maiores commodi repudiandae modi, cumque, enim earum saepe praesentium!",
        image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
        replies: [],
    },
]

export default function Chatroom() {
    const navigate = useNavigate()
    const [posts, setPosts] = useState(mockPosts)
    const [postText, setPostText] = useState("")
    const [replyText, setReplyText] = useState<Record<string, string>>({})
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})

    const handlePostSubmit = () => {
        if (postText.trim()) {
            const newPost: Post = {
                id: Date.now().toString(),
                author: "Your Name",
                handle: CURRENT_USER,
                avatar: "https://github.com/shadcn.png",
                verified: true,
                title: "New Post",
                content: postText,
                image: "https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto",
                replies: [],
            }
            setPosts([newPost, ...posts])
            setPostText("")
        }
    }

    const handleReplySubmit = (postId: string) => {
        const text = replyText[postId]?.trim()
        if (text) {
            setPosts(
                posts.map((post) => {
                    if (post.id === postId) {
                        const taggedHandle = text.match(/@(\w+)/)?.[1]
                        const newReply: Reply = {
                            id: Date.now().toString(),
                            author: "Your Name",
                            handle: CURRENT_USER,
                            avatar: "https://github.com/shadcn.png",
                            text: text,
                            taggedUser: taggedHandle,
                        }
                        return { ...post, replies: [...post.replies, newReply] }
                    }
                    return post
                })
            )
            setReplyText({ ...replyText, [postId]: "" })
        }
    }

    const goToUserProfile = (handle: string) => {
        navigate(`/user-details/${handle}`)
    }

    return (
        <>
            <div className="container mx-auto max-w-4xl space-y-2 mt-8">
                <h1 className="text-4xl font-bold tracking-widest text-center my-8">Chat</h1>
                <Card className="border-0 shadow-lg">
                    <CardContent className="pt-6 space-y-3">
                        <Textarea
                            placeholder="What's on your mind?"
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            className="resize-none rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={handlePostSubmit}
                                disabled={!postText.trim()}
                                className="flex-1"
                            >
                                <SendIcon className="w-4 h-4" />
                                Post
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col flex-wrap gap-8 justify-center items-center mt-12 px-4 pb-12">
                {posts.map((post) => (
                    <Card key={post.id} className="max-w-4xl w-full shadow-lg border-0 hover:shadow-xl transition-shadow">
                        <CardHeader className="flex items-center justify-between gap-3 pb-4">
                            <div className="flex items-center gap-3 flex-1">
                                <button
                                    onClick={() => goToUserProfile(post.handle)}
                                    className="flex items-center gap-3 hover:opacity-80 transition group cursor-pointer"
                                >
                                    <Avatar className="ring-2 ring-black w-12 h-12">
                                        <AvatarImage src={post.avatar} alt={post.author} />
                                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <div className="flex items-center gap-1">
                                            <CardTitle className="flex items-center gap-1 text-base group-hover:text-blue-600 transition">
                                                {post.author}{" "}
                                                {post.verified && (
                                                    <BadgeCheckIcon className="size-4 fill-sky-600 stroke-white dark:fill-sky-400" />
                                                )}
                                            </CardTitle>
                                        </div>
                                        <CardDescription>@{post.handle}</CardDescription>
                                    </div>
                                </button>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <h2 className="text-3xl font-semibold tracking-wide">{post.title}</h2>

                            <img
                                src={post.image}
                                alt="Post banner"
                                className="aspect-video w-full rounded-md object-cover"
                            />

                            <p className="text-lg font-semibold tracking-wide text-gray-700">
                                {post.content}
                            </p>

                            {/* Replies Section */}
                            <div className="border-t pt-4 space-y-4">
                                <button
                                    onClick={() =>
                                        setExpandedReplies({
                                            ...expandedReplies,
                                            [post.id]: !expandedReplies[post.id],
                                        })
                                    }
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                                >
                                    {post.replies.length === 0
                                        ? "Add a reply"
                                        : `${post.replies.length} ${post.replies.length === 1 ? "reply" : "replies"}`}
                                </button>

                                {expandedReplies[post.id] && (
                                    <div className="space-y-4 mt-4 pt-4 border-t">
                                        {/* Existing Replies */}
                                        {post.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className={`p-4 rounded-lg border-l-4 transition ${reply.taggedUser === CURRENT_USER
                                                        ? "bg-yellow-50 border-yellow-400"
                                                        : "bg-gray-50 border-gray-300"
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => goToUserProfile(reply.handle)}
                                                    className="flex items-center gap-2 mb-2 hover:opacity-80 transition group cursor-pointer"
                                                >
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={reply.avatar} alt={reply.author} />
                                                        <AvatarFallback>{reply.author[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-semibold text-sm">
                                                            {reply.author}
                                                        </span>
                                                        <span className="text-xs text-gray-500">@{reply.handle}</span>
                                                    </div>
                                                </button>
                                                <p className="text-sm text-gray-800">{reply.text}</p>
                                            </div>
                                        ))}

                                        {/* Reply Input */}
                                        <div className="space-y-4 mt-4">
                                            <Textarea
                                                placeholder="Reply (use @handle to tag)"
                                                value={replyText[post.id] || ""}
                                                onChange={(e) =>
                                                    setReplyText({ ...replyText, [post.id]: e.target.value })
                                                }
                                                className="resize-none rounded-lg border-gray-200"
                                                rows={2}
                                            />
                                            <Button
                                                onClick={() => handleReplySubmit(post.id)}
                                                disabled={!replyText[post.id]?.trim()}
                                                className="w-full cursor-pointer"
                                            >
                                                <SendIcon className="w-4 h-4" />
                                                Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}
