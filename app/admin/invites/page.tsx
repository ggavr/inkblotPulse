import { getAllInvites } from "@/lib/data";
import { InviteManager } from "@/components/admin/invite-manager";

export default async function InvitesPage() {
  const invites = await getAllInvites();
  return <InviteManager invites={invites} />;
}
