import { BookManager } from "@/components/admin/book-manager";
import { getBooks } from "@/lib/data";

export default async function AdminBooksPage() {
  const books = await getBooks();
  return <BookManager books={books} />;
}
