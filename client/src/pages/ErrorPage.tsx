import { AlertOctagon } from "lucide-react";
import { StatusPage } from "../components/common/StatusPage";

interface ErrorPageProps {
  onReset?: () => void;
}

export default function ErrorPage({ onReset }: ErrorPageProps) {
  return (
    <StatusPage
      code="500"
      icon={AlertOctagon}
      title="Something broke"
      message="An unexpected error stopped the page from loading. Try again — if it keeps happening, let the team know."
      primaryAction={{
        label: "Try again",
        onClick: onReset ?? (() => window.location.reload()),
      }}
      secondaryAction={{ label: "Go to dashboard", to: "/" }}
    />
  );
}
