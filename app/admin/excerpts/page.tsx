import { ExcerptManager } from "@/components/admin/excerpt-manager";
import { getAllExcerpts, getBooks } from "@/lib/data";

export default async function AdminExcerptsPage() {
  const [books, excerpts] = await Promise.all([getBooks(), getAllExcerpts()]);
  return <ExcerptManager books={books} excerpts={excerpts} />;
}
