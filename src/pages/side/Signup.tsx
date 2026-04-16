import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPinned } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useState } from "react"

export default function Signup() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError((data && (data.message || data.error)) || `Signup failed (${res.status})`)
        return
      }

      // Store token if returned
      const token = data?.token ?? data?.accessToken ?? null
      if (token) {
        localStorage.setItem("authToken", token)
      } else {
        localStorage.setItem("authData", JSON.stringify(data))
      }

      // Navigate to home or login after successful signup
      navigate("/")
    } catch (err: any) {
      setError(err?.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="border-2 border-black w-md h-fit p-4 rounded-2xl items-center justify-center">
        <Link to="/">
          <h1 className="flex items-center gap-2 text-3xl justify-center font-extrabold mt-4 mb-8">
            <MapPinned size={50} />
            ZoneMakers
          </h1>
        </Link>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="fieldgroup-username" className="text-base font-bold tracking-wide">
                Username
              </FieldLabel>
              <Input
                id="fieldgroup-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="John Doe"
                className="max-md:text-sm"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-email" className="text-base font-bold tracking-wide">
                E-mail
              </FieldLabel>
              <Input
                id="fieldgroup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                className="max-md:text-sm"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-password" className="text-base font-bold tracking-wide">
                Password
              </FieldLabel>
              <Input
                id="fieldgroup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="max-md:text-sm"
                required
              />
            </Field>

            {error && (
              <div role="alert" className="text-sm text-red-600">
                {error}
              </div>
            )}

            <Field orientation="horizontal" className="flex flex-col">
              <Button type="submit" className="w-full p-5 text-base font-bold tracking-wide cursor-pointer" disabled={loading}>
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
