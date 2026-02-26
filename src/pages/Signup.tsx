import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPinned } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { signup } from "../api/auth/WebToken";

{/**
import { useId } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
*/}

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    {/**
    const handleSignup = async () => {
            const { token, userId } = await signup(email, password);

            // Store token and password for future requests
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            sessionStorage.setItem("password", password);
    };
     */}

    {/**
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
    */}

    return (
        <div className='flex items-center justify-center h-screen px-4'>
            <div className='border-2 border-black w-md h-fit p-4 rounded-2xl items-center justify-center'>
                <Link to="/">
                    <h1 className="flex items-center gap-2 text-3xl justify-center font-extrabold mt-4 mb-8">
                        <MapPinned size={50} />
                        ZoneMakers
                    </h1>
                </Link>
                <FieldGroup className="gap-6">
                    {/**
                    <Field>
                        <FieldLabel htmlFor="country" className="text-base font-bold tracking-wide">Select a country</FieldLabel>
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
                    </Field>
                    */}
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-username" className="text-base font-bold tracking-wide">Username</FieldLabel>
                        <Input id="fieldgroup-username" placeholder="John Doe" className="max-md:text-sm" />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-email" className="text-base font-bold tracking-wide">E-mail</FieldLabel>
                        <Input id="fieldgroup-email" type="email" placeholder="johndoe@example.com" className="max-md:text-sm" onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-password" className="text-base font-bold tracking-wide">Password</FieldLabel>
                        <Input id="fieldgroup-password" type="password" placeholder="********" className="max-md:text-sm" onChange={(e) => setPassword(e.target.value)} />
                    </Field>
                    <Field orientation="horizontal" className="flex flex-col">
                        <Button type="submit" className="w-full p-5 text-base font-bold tracking-wide cursor-pointer">Sign up</Button> {/**onClick={handleSignup}*/}
                    </Field>
                </FieldGroup>
            </div>
        </div>

    )
}
