import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPinned } from "lucide-react";
import { Link } from "react-router";

export default function Login() {
    return (
        <div className='flex items-center justify-center h-screen px-4'>
            <div className='border-2 border-black w-md h-fit p-4 rounded-2xl items-center justify-center'>
                <h1 className="flex items-center gap-2 text-3xl justify-center font-extrabold mt-4 mb-8">
                    <MapPinned size={50} />
                    ZoneMakers
                </h1>
                <FieldGroup className="gap-6">
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-username" className="text-base font-bold tracking-wide">Username</FieldLabel>
                        <Input id="fieldgroup-username" placeholder="John Doe" className="max-md:text-sm" />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-password" className="text-base font-bold tracking-wide">Password</FieldLabel>
                        <Input id="fieldgroup-password" type="password" placeholder="********" className="max-md:text-sm" />
                    </Field>
                    <Field orientation="horizontal" className="flex flex-col">
                        <Button type="submit" className="w-full p-5 text-base font-bold tracking-wide cursor-pointer">Login</Button>
                        <Link to="register" className="w-full">
                            <Button variant={"outline"} className="w-full p-5 text-base font-bold tracking-wide cursor-pointer">Sign up</Button>
                        </Link>
                    </Field>
                </FieldGroup>
            </div>
        </div>

    )
}
