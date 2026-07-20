import { Compass } from "lucide-react";
import { StatusPage } from "../components/common/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      icon={Compass}
      title="Page not found"
      message="That route doesn't exist — check the URL, or head back to somewhere that does."
      primaryAction={{ label: "Go to dashboard", to: "/" }}
      secondaryAction={{ label: "Sign in", to: "/login" }}
    />
  );
}
