import { ProjectOne } from "@/components/project-one"
import { ProjectTwo } from "@/components/project-two"
import { ProjectThree } from "@/components/project-three"
import { ProjectFour } from "@/components/project-four"

export default function Page() {
  return (
    <main className="bg-background">
      <ProjectOne />
      <ProjectTwo />
      <ProjectThree />
      <ProjectFour />
    </main>
  )
}
