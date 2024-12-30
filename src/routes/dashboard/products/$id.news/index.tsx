import {
  useRetrieveNews,
  useRetrieveNewsStatistics,
} from "@/client/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNewsByProduct, useNewsStatisticsByProductId } from "@/gql/gpl";
import { formatDateTime } from "@/lib/utils";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { DeleteIcon, EditIcon, PlusIcon } from "lucide-react";

const NewsAdminDashboard = () => {
  const { id }: { id: number } = useParams({ strict: false });

  const { data: statistics } = useNewsStatisticsByProductId(
    {
      archived: true,
      draft: true,
      published: true,
      recentlyUpdated: true,
      total: true,
    },
    { productId: id.toString() }
  );

  const { data: news } = useNewsByProduct(
    {
      id: true,
      title: true,
      state: true,
      updatedAt: true,
    },
    { productId: id.toString() }
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Total News Articles</h2>
          <p className="text-3xl font-bold text-blue-600">
            {statistics?.total ?? 0}
          </p>
        </Card>

        <Card className="p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Drafts</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {statistics?.draft ?? 0}
          </p>
        </Card>

        <Card className="p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Recently Updated</h2>
          <p className="text-3xl font-bold text-green-600">
            {statistics?.recentlyUpdated ?? 0}
          </p>
        </Card>
      </div>

      <div className="rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold mb-4">News Articles</h2>
          <Link to="/dashboard/products/$id/news/create">
            <Button>
              <PlusIcon /> Add News
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news &&
              news.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>
                    <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">
                      {article.state.slice(0, 1).toUpperCase() +
                        article.state.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateTime(article.updatedAt)}</TableCell>
                  <TableCell>
                    <Link to={`/dashboard/products/${id}/news/${article.id}`}>
                      <Button className="rounded text-xs" variant={"ghost"}>
                        <EditIcon />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      className="rounded text-xs ml-2"
                      variant={"destructive"}
                    >
                      <DeleteIcon />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export const Route = createFileRoute("/dashboard/products/$id/news/")({
  component: NewsAdminDashboard,
});

export default NewsAdminDashboard;
