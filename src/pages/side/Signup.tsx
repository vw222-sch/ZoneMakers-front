import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPinned } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useState } from "react"
import * as authService from "@/services/authService"
import { useAuth } from "@/hooks/AuthContext"
import { getErrorMessage } from "@/lib/api"
import { REGIONS, REGION_COLORS } from "@/types"

export default function Signup() {
  const { login } = useAuth();

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [region, setRegion] = useState<number | "">("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { token, id } = await authService.signup(username, email, password, region as number)
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
    <div className="flex items-center justify-center h-screen px-4">
      <div className="border-2 border-black w-md h-fit p-4 rounded-2xl items-center justify-center bg-white shadow-lg">
        <Link to="/">
          <h1 className="flex items-center gap-2 text-3xl justify-center font-extrabold mt-4 mb-8 text-black hover:opacity-80 transition">
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
            <Field>
              <FieldLabel className="text-base font-bold tracking-wide">
                Region
              </FieldLabel>
              <Select
                value={region === "" ? "" : String(region)}
                onValueChange={(val) => setRegion(Number(val))}
                required
              >
                <SelectTrigger className="max-md:text-sm">
                  <SelectValue placeholder="Select your region..." />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block shrink-0"
                          style={{ background: REGION_COLORS[r.name] }}
                        />
                        {r.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {error && (
              <div role="alert" className="text-sm text-red-600 font-semibold text-center bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}

            <Field orientation="horizontal" className="flex flex-col mt-2">
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