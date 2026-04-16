import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function Support() {
    return (
        <>
            <div className="container mx-auto max-w-6xl px-4 min-h-screen">
                <h1 className="fl-text-4xl/6xl font-bold tracking-widest text-center my-16">Support</h1>
                <FieldGroup className="gap-6">
                    <Field>
                        <FieldLabel className="text-base font-bold tracking-wide">Subject</FieldLabel>

                        <Select>
                            <SelectTrigger className="w-full h-10!">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Technical Support</SelectLabel>
                                    <SelectItem value="bug">Report a Bug</SelectItem>
                                    <SelectItem value="display">Display/UI Issue</SelectItem>
                                    <SelectItem value="broken_link">Broken Link</SelectItem>
                                    <SelectItem value="mobile">Mobile Issue</SelectItem>
                                    <SelectItem value="error_msg">Error Message</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectLabel>Account & Security</SelectLabel>
                                    <SelectItem value="login">Login Issue</SelectItem>
                                    <SelectItem value="password">Password Reset</SelectItem>
                                    <SelectItem value="profile">Profile Settings</SelectItem>
                                    <SelectItem value="hacked">Compromised Account</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectLabel>Report Abuse</SelectLabel>
                                    <SelectItem value="spam">Spam</SelectItem>
                                    <SelectItem value="harassment">Harassment/Bullying</SelectItem>
                                    <SelectItem value="impersonation">Impersonation</SelectItem>
                                    <SelectItem value="offensive">Inappropriate Content</SelectItem>
                                    <SelectItem value="scam">
                                        Fraud or Scam
                                    </SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectLabel>Other</SelectLabel>
                                    <SelectItem value="feedback">General Feedback</SelectItem>
                                    <SelectItem value="feature">Feature Request</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="textarea-message" className="text-base font-bold tracking-wide">Give us more detail (optional)</FieldLabel>
                        <Textarea id="textarea-message" placeholder="Type your message here." className="h-40" />
                    </Field>

                    <Field>
                        <Button type="submit" className="w-full p-5 text-base font-bold tracking-wide cursor-pointer">Send Message</Button>
                    </Field>
                </FieldGroup>
            </div>



        </>
    );
}