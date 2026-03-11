import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import DACHMap from "@/DACHMap.tsx"

import { useId } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { BadgeCheckIcon, EllipsisIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';

export default function Chat() {
  const countries = [
    { value: '1', label: 'India', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/india.png' },
    { value: '2', label: 'China', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/china.png' },
    { value: '3', label: 'Monaco', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/monaco.png' },
    { value: '4', label: 'Serbia', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/serbia.png' },
    { value: '5', label: 'Romania', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/romania.png' },
    { value: '6', label: 'Mayotte', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/mayotte.png' },
    { value: '7', label: 'Iraq', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/iraq.png' },
    { value: '8', label: 'Syria', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/syria.png' },
    { value: '9', label: 'Korea', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/korea.png' },
    { value: '10', label: 'Zimbabwe', flag: 'https://cdn.shadcnstudio.com/ss-assets/flags/zimbabwe.png' }
  ]

  const id = useId()
  return (
    <div className='container mx-auto max-w-7xl px-8'>
      <div className='grid grid-cols-[400px] lg:grid-cols-[1fr_200px]'>
        <DACHMap />
        <Select defaultValue='1'>
          <SelectTrigger
            id={id}
            className='[&>span_svg]:text-muted-foreground/80 w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0'
          >
            <SelectValue placeholder='Select framework' />
          </SelectTrigger>
          <SelectContent className='[&_*[role=option]>span>svg]:text-muted-foreground/80 max-h-100 [&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0'>
            {countries.map(country => (
              <SelectItem key={country.value} value={country.value}>
                <img src={country.flag} alt={`${country.label} flag`} className='h-4 w-5' />{' '}
                <span className='truncate'>{country.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex flex-col flex-wrap gap-16 justify-center items-center mt-16'>
        <Input></Input>
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
    </div >
  )
}
