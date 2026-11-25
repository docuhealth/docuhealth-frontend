import { createFileRoute } from "@tanstack/react-router";
import { ProxyAccessPage } from "@/features/patient/components/proxy-access-page";

export const Route = createFileRoute("/patient/family/proxies/$proxyId")({
  component: Page,
});

function Page() {
  const { proxyId } = Route.useParams();
  return <ProxyAccessPage proxyId={proxyId} />;
}
