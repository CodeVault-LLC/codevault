import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Editor } from "@/components/editor";
import { editorMode } from "@/components/editor/extensions";
import { Button } from "@/components/ui/button";
import { EditorRef } from "@/components/editor/Editor";
import { useNewsById, useUpdateNews } from "@/gql/gpl";

const NewsEditor = () => {
  const { id, newsId } = useParams({ strict: false });

  const [status, setStatus] = useState("Draft");
  const [title, setTitle] = useState("");
  const editorRef = useRef<EditorRef>(null);

  const { data: news } = useNewsById(
    {
      id: true,
      title: true,
      content: true,
      state: true,
    },
    {
      id,
    }
  );
  const { mutate, isPending } = useUpdateNews({
    id: true,
    title: true,
    content: true,
    state: true,
  });

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setStatus(news.state);
      editorRef.current.updateContent(news.content);
    }
  }, [news]);

  return (
    <div className="flex">
      <div className="w-80 p-2 border-r">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Title</h3>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title here..."
            className="w-full p-2 border rounded focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <Select
            onValueChange={setStatus}
            value={status.slice(0, 1).toUpperCase() + status.slice(1)}
            defaultValue="Draft"
          >
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
          </Select>
        </div>
        <div>
          <Button
            className="w-full"
            variant="default"
            onClick={() => {
              mutate({
                id: newsId,
                data: JSON.stringify({
                  title,
                  content: editorRef.current?.getText() ?? "",
                  status: status.toLowerCase(),
                }),
              });
            }}
            isLoading={isPending}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <Editor
            editable
            editorType={editorMode.fullFeatured}
            ref={editorRef}
          />
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/products/$id/news/$newsId")({
  component: NewsEditor,
});

export default NewsEditor;
