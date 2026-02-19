import { BadgeCheckIcon, EllipsisIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Input } from '@/components/ui/input'

export default function News() {
    return (
        <div className="container mx-auto max-w-7xl px-4">
            <h1 className="text-5xl font-bold tracking-widest text-center mb-16">Weekly News</h1>

            <div className='border-2 p-8 rounded-2xl mb-16'>
                <FieldGroup className="gap-6">
                    <Field>
                        <FieldLabel htmlFor="subject" className="text-base font-bold tracking-wide">Subject</FieldLabel>
                        <Input id="subject" type="text" className='h-10' />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="textarea-message" className="text-base font-bold tracking-wide">Description</FieldLabel>
                        <Textarea id="textarea-message" placeholder="Type your message here." className="h-40" />
                    </Field>

                    <Field>
                        <Button type="submit" className="w-full p-5 text-base font-bold tracking-wide cursor-pointer">Send Message</Button>
                    </Field>
                </FieldGroup>
            </div>

            <div className='flex flex-col flex-wrap gap-16 justify-center items-center'>
                <Card className='max-w-4xl mx-auto'>
                    <CardHeader className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='ring-2 ring-black w-12 h-12'>
                                <AvatarImage src='https://github.com/shadcn.png' alt='Hallie Richards' />
                                <AvatarFallback className='text-xs'>PG</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col gap-0.5'>
                                <CardTitle className='flex items-center gap-1 text-base'>
                                    John Doe <BadgeCheckIcon className='size-4 fill-sky-600 stroke-white dark:fill-sky-400' />
                                </CardTitle>
                                <CardDescription>@johndoe</CardDescription>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='icon' aria-label='Toggle menu'>
                                <EllipsisIcon />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <h1 className='text-3xl font-semibold tracking-wide'>France 🇫🇷</h1>

                        <img
                            src='https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto'
                            alt='Banner'
                            className='aspect-video w-full rounded-md object-cover'
                        />
                        <p className='text-lg font-semibold tracking-wide'>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae incidunt doloribus ducimus porro veritatis velit assumenda. Quidem alias, voluptatem blanditiis ullam maiores commodi repudiandae modi, cumque, enim earum saepe praesentium!
                        </p>
                    </CardContent>
                </Card>

                <Card className='max-w-4xl mx-auto'>
                    <CardHeader className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='ring-2 ring-black w-12 h-12'>
                                <AvatarImage src='https://github.com/shadcn.png' alt='Hallie Richards' />
                                <AvatarFallback className='text-xs'>PG</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col gap-0.5'>
                                <CardTitle className='flex items-center gap-1 text-base'>
                                    John Doe <BadgeCheckIcon className='size-4 fill-sky-600 stroke-white dark:fill-sky-400' />
                                </CardTitle>
                                <CardDescription>@johndoe</CardDescription>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='icon' aria-label='Toggle menu'>
                                <EllipsisIcon />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <h1 className='text-3xl font-semibold tracking-wide'>France 🇫🇷</h1>

                        <img
                            src='https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto'
                            alt='Banner'
                            className='aspect-video w-full rounded-md object-cover'
                        />
                        <p className='text-lg font-semibold tracking-wide'>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae incidunt doloribus ducimus porro veritatis velit assumenda. Quidem alias, voluptatem blanditiis ullam maiores commodi repudiandae modi, cumque, enim earum saepe praesentium!
                        </p>
                    </CardContent>
                </Card>

                <Card className='max-w-4xl mx-auto'>
                    <CardHeader className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='ring-2 ring-black w-12 h-12'>
                                <AvatarImage src='https://github.com/shadcn.png' alt='Hallie Richards' />
                                <AvatarFallback className='text-xs'>PG</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col gap-0.5'>
                                <CardTitle className='flex items-center gap-1 text-base'>
                                    John Doe <BadgeCheckIcon className='size-4 fill-sky-600 stroke-white dark:fill-sky-400' />
                                </CardTitle>
                                <CardDescription>@johndoe</CardDescription>
                            </div>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='icon' aria-label='Toggle menu'>
                                <EllipsisIcon />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <h1 className='text-3xl font-semibold tracking-wide'>France 🇫🇷</h1>

                        <img
                            src='https://cdn.shadcnstudio.com/ss-assets/components/card/image-6.png?width=350&format=auto'
                            alt='Banner'
                            className='aspect-video w-full rounded-md object-cover'
                        />
                        <p className='text-lg font-semibold tracking-wide'>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae incidunt doloribus ducimus porro veritatis velit assumenda. Quidem alias, voluptatem blanditiis ullam maiores commodi repudiandae modi, cumque, enim earum saepe praesentium!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}