import { createFileRoute } from '@tanstack/react-router'

function RouteComponent() {
  return (
    <div>
      <h1>Products</h1>
    </div>
  )
}

export const Route = createFileRoute('/projects')({
  component: RouteComponent,
})
