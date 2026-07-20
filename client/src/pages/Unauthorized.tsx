import { ShieldAlert } from "lucide-react";
import { StatusPage } from "../components/common/StatusPage";

export default function Unauthorized() {
  return (
    <StatusPage
      code="403"
      icon={ShieldAlert}
      title="Access restricted"
      message="Your account doesn't have permission to view this page. Contact an administrator if you think this is wrong."
      primaryAction={{ label: "Go to dashboard", to: "/" }}
    />
  );
}
