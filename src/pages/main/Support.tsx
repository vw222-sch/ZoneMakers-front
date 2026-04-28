import { useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { createSupportTicket } from "@/services/supportService";
import { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/hooks/AuthContext";

export default function Support() {
    const { state } = useAuth();
    const isLoggedIn = state.isLoggedIn;

    const [formData, setFormData] = useState({
        subject: "",
        topic: "",
        description: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
        type: null,
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus({ type: null, message: "" });

        if (!formData.topic) {
            setStatus({ type: "error", message: "Please select a topic from the dropdown!" });
            return;
        }
        if (!formData.subject.trim()) {
            setStatus({ type: "error", message: "Please enter the subject of your message!" });
            return;
        }
        if (!formData.description.trim()) {
            setStatus({ type: "error", message: "Please describe your issue in detail!" });
            return;
        }

        if (!isLoggedIn) {
            setStatus({ type: "error", message: "You are not logged in! Please log in to use the support feature." });
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                subject: formData.subject,
                topic: Number(formData.topic),
                description: formData.description
            };

            await createSupportTicket(payload);

            setStatus({
                type: "success",
                message: "Your message has been sent successfully! We will contact you soon."
            });

            setFormData({ subject: "", topic: "", description: "" });
        } catch (error: unknown) {
            console.error("Support API error:", error);
            setStatus({
                type: "error",
                message: getErrorMessage(error)
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="container mx-auto max-w-6xl px-4 py-12">
                <h1 className="fl-text-4xl/6xl font-bold tracking-widest text-center my-16">
                    Support
                </h1>

                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                    <FieldGroup className="gap-6">
                        <Field>
                            <FieldLabel className="text-base font-bold tracking-wide">Topic</FieldLabel>
                            <Select
                                value={formData.topic}
                                onValueChange={(value) => setFormData({ ...formData, topic: value })}
                            >
                                <SelectTrigger className="w-full h-10!">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Technical Support</SelectLabel>
                                        <SelectItem value="1">Report a Bug</SelectItem>
                                        <SelectItem value="2">Display/UI Issue</SelectItem>
                                        <SelectItem value="3">Broken Link</SelectItem>
                                        <SelectItem value="4">Mobile Issue</SelectItem>
                                        <SelectItem value="5">Error Message</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Account & Security</SelectLabel>
                                        <SelectItem value="6">Login Issue</SelectItem>
                                        <SelectItem value="7">Password Reset</SelectItem>
                                        <SelectItem value="8">Profile Settings</SelectItem>
                                        <SelectItem value="9">Compromised Account</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Report Abuse</SelectLabel>
                                        <SelectItem value="10">Spam</SelectItem>
                                        <SelectItem value="11">Harassment/Bullying</SelectItem>
                                        <SelectItem value="12">Impersonation</SelectItem>
                                        <SelectItem value="13">Inappropriate Content</SelectItem>
                                        <SelectItem value="14">Fraud or Scam</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel>Other</SelectLabel>
                                        <SelectItem value="15">General Feedback</SelectItem>
                                        <SelectItem value="16">Feature Request</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="input-subject" className="text-base font-bold tracking-wide">
                                Subject
                            </FieldLabel>
                            <Input
                                id="input-subject"
                                placeholder="Describe the issue..."
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="textarea-message" className="text-base font-bold tracking-wide">
                                Description
                            </FieldLabel>
                            <Textarea
                                id="textarea-message"
                                placeholder="Describe the issue in detail..."
                                value={formData.description}
                                className="h-40"
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Field>

                        {status.message && (
                            <div className={`p-4 rounded-xl font-bold text-center border ${status.type === "success"
                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }`}>
                                {status.message}
                            </div>
                        )}

                        <Field>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full p-5 text-base font-bold tracking-wide cursor-pointer"
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </div>
        </div>
    );
}