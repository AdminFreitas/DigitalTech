import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/ferramentas')({
  component: FerramentasLayout,
});

function FerramentasLayout() {
  return <Outlet />;
}
