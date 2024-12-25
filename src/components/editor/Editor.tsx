import {
  Editor as TipTapEditor,
  EditorContent,
  useEditor,
} from "@tiptap/react";
import { editorMode, getEditorExtensionsByType } from "./extensions";
import { forwardRef, useImperativeHandle } from "react";
import Toolbar from "./toolbar/Toolbar";
import BubbleMenu from "./toolbar/BubbleMenu";

interface EditorProps {
  editable?: boolean;
  editorType: editorMode;
  onUpdate?: (editor: TipTapEditor) => void;
}

export interface EditorRef {
  getHTML: () => string | undefined;
  getText: () => string | undefined;
  getJSON: () => Record<string, any> | undefined;
}

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  const { editable = true, editorType, onUpdate } = props;

  const extensions = getEditorExtensionsByType(editorType);

  const editor = useEditor({
    onUpdate: ({ editor }) => {
      if (onUpdate) onUpdate(editor);
    },
    extensions,
    editable,
    content: `<p>Until now, trying to style an article, document, or blog post with Tailwind has been a tedious task that required a keen eye for typography and a lot of complex custom CSS.</p><p>By default, Tailwind removes all of the default browser styling from paragraphs, headings, lists and more. This ends up being really useful for building application UIs because you spend less time undoing user-agent styles, but when you <em>really are</em> just trying to style some content that came from a rich-text editor in a CMS or a markdown file, it can be surprising and unintuitive.</p><p>We get lots of complaints about it actually, with people regularly asking us things like:</p><blockquote><p><strong><em>Why is Tailwind removing the default styles on my </em></strong><code>h1</code><strong><em> elements? How do I disable this? What do you mean I lose all the other base styles too?</em></strong></p></blockquote><p>We hear you, but we're not convinced that simply disabling our base styles is what you really want. You don't want to have to remove annoying margins every time you use a <code>p</code> element in a piece of your dashboard UI. And I doubt you really want your blog posts to use the user-agent styles either — you want them to look <em>awesome</em>, not awful.</p><p>The <code>@tailwindcss/typography</code> plugin is our attempt to give you what you <em>actually</em> want, without any of the downsides of doing something stupid like disabling our base styles.</p><p>It adds a new <code>prose</code> class that you can slap on any block of vanilla HTML content and turn it into a beautiful, well-formatted document:</p><pre><code class="language-html">&lt;article class="prose"&gt;
  &lt;h1&gt;Garlic bread with cheese: What the science tells us&lt;/h1&gt;
  &lt;p&gt;
    For years parents have espoused the health benefits of eating garlic bread with cheese to their
    children, with the food earning such an iconic status in our culture that kids will often dress
    up as warm, cheesy loaf for Halloween.
  &lt;/p&gt;
  &lt;p&gt;
    But a recent study shows that the celebrated appetizer may be linked to a series of rabies cases
    springing up around the country.
  &lt;/p&gt;
  &lt;!-- ... --&gt;
&lt;/article&gt;
</code></pre><p>For more information about how to use the plugin and the features it includes, <a target="_blank" rel="noopener noreferrer" href="https://github.com/tailwindcss/typography/blob/master/README.md"><strong><u>read the documentation</u></strong></a>.</p>`,
    editorProps: {
      attributes: {
        class:
          "outline-none px-4 py-2 ring-2 ring-blue-100 rounded-lg prose max-w-4xl",
      },
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => editor?.getHTML(),
      getText: () => editor?.getText(),
      getJSON: () => editor?.getJSON(),
      updateContent: (content: string) => {
        editor?.commands.setContent(content);
      },
    }),
    []
  );

  if (!editor) {
    return null;
  }

  return (
    <div>
      <Toolbar editor={editor} />
      <BubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
});

export default Editor;
