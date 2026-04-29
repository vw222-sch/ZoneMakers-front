import { useState } from "react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router"
import * as authService from "@/services/authService"
import { useAuth } from "@/hooks/AuthContext"
import { getErrorMessage } from "@/lib/api"

export default function Login() {
  const { login } = useAuth()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { token, id } = await authService.login(username, password)
      const userData = await authService.fetchUserData(id)

      login(token, id, userData)
      navigate("/")
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen px-4 bg-background">
      <div className="border w-md h-fit p-6 rounded-2xl bg-card text-card-foreground shadow-2xl">
        <Link to="/">
          <h1 className="flex items-center gap-2 text-3xl justify-center font-extrabold mt-2 mb-8 hover:opacity-80 transition">
            <img src="/ZM-Official-Light.png" alt="ZM" className="w-10 h-10" />
            ZoneMakers
          </h1>
        </Link>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="username" className="text-base font-bold tracking-wide">
                Username
              </FieldLabel>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="max-md:text-sm"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="text-base font-bold tracking-wide">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="max-md:text-sm"
                required
              />
            </Field>

            {error && (
              <div role="alert" className="text-sm text-destructive font-semibold text-center bg-destructive/10 border border-destructive/20 p-2 rounded-md">
                {error}
              </div>
            )}

            <Field orientation="horizontal" className="flex flex-col mt-2 gap-2">
              <Button type="submit" className="w-full p-5 text-base font-bold tracking-wide" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Link to="/signup" className="w-full">
                <Button variant="outline" type="button" className="w-full p-5 text-base font-bold tracking-wide">
                  Sign up
                </Button>
              </Link>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}