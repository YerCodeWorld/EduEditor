export const title = "EduGuiders: An initial ride";

const content = `
<h2>POST NOT FOUND</h2>

<p>
  This is just a placeholder text that displays when the requested post is either not found or failed to load. This can happen for several reasons, among the main ones errors from the code (the developer), or truly just a fetching/networking error.
</p>

<h3>What is EduGuiders?</h3>

<p>
  EduGuiders is a platform created with no mere objectives than helping others and creating a recreational center for people from all interests. It aims to achieve a unified platform that allows everybody to build and use their desired resources with ease.
</p>

<figure>
   <img 
      src="https://res.cloudinary.com/dmhzdv5kf/image/upload/v1735024108/668464364417bf4b0898c526_docs-v2-blog_s0krle.jpg"
      alt="Tiptap Editor"
      data-width="1200"
      data-height="800"
   />
   <figcaption>EduGuiders: A powerful combination of resources</figcaption>
</figure>

<h3>Key Features</h3>

<ul>
  <li>Ability to contact all-stars teachers</li>
  <li>Create and use exercises with just some clicks</li>
  <li>Play games with your learning partners and friends</li>
  <li>Read top-notch learning strategies</li>
  <li>Get all sort of services, from conversation to exams</li>
</ul>

<h2>Getting Started</h2>

<h3>Usage</h3>
<p>The interface is made the most intuitive way possible, but if you are lost, just look on the menus:</p>
<pre><code class="language-bash">menu header (computers) and homepage tiles</code></pre>

<h3>Basic Setup</h3>
<p>Create a basic Tiptap editor component:</p>
<pre><code class="language-javascript">import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '&lt;p&gt;Hello, Tiptap!&lt;/p&gt;',
  })

  return &lt;EditorContent editor={editor} /&gt;
}

export default TiptapEditor</code></pre>

<h3>Using in Next.js</h3>
<p>Import and use the Tiptap editor in your Next.js pages:</p>
<pre><code class="language-javascript">import TiptapEditor from '../components/TiptapEditor'

const EditorPage = () => {
  return (
    &lt;div&gt;
      &lt;h1&gt;My Tiptap Editor&lt;/h1&gt;
      &lt;TiptapEditor /&gt;
    &lt;/div&gt;
  )
}

export default EditorPage</code></pre>

<h2>Customizing</h2>
<p>
  Tiptap's extensibility allows easy customization. Here's an example of adding a custom button to toggle bold text:
</p>
<pre><code class="language-javascript">import { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '&lt;p&gt;Hello, Tiptap!&lt;/p&gt;',
  })

  const toggleBold = useCallback(() => {
    editor.chain().focus().toggleBold().run()
  }, [editor])

  return (
    &lt;div&gt;
      &lt;button onClick={toggleBold}&gt;Toggle Bold&lt;/button&gt;
      &lt;EditorContent editor={editor} /&gt;
    &lt;/div&gt;
  )
}

export default TiptapEditor</code></pre>

<h2>Collaborative</h2>
<p>
  Tiptap supports collaborative editing. Here's a basic setup using Socket.io in a Next.js application:
</p>
<pre><code class="language-javascript">import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const CollaborativeEditor = () => {
  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider('ws://localhost:1234', 'example-document', ydoc)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
      }),
    ],
  })

  return &lt;EditorContent editor={editor} /&gt;
}

export default CollaborativeEditor</code></pre>

<h2>Optimizing</h2>

<ul>
  <li><strong>Dynamic Imports:</strong> Use Next.js dynamic imports to load Tiptap when needed.</li>
  <li><strong>Server-side Rendering:</strong> Ensure Tiptap is only instantiated on the client-side.</li>
  <li><strong>Persistent Storage:</strong> Implement storage solutions using Next.js API routes and databases.</li>
</ul>

<pre><code class="language-javascript">import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(() => import('../components/TiptapEditor'), {
  ssr: false,
  loading: () => &lt;p&gt;Loading editor...&lt;/p&gt;,
})

const EditorPage = () => {
  return (
    &lt;div&gt;
      &lt;h1&gt;My Tiptap Editor&lt;/h1&gt;
      &lt;TiptapEditor /&gt;
    &lt;/div&gt;
  )
}

export default EditorPage</code></pre>

<h2>Advanced Features</h2>
<ul>
  <li>Custom nodes and marks for specialized content</li>
  <li>Collaborative cursors and highlighting</li>
  <li>History management (undo/redo)</li>
  <li>Complex structures (tables, task lists)</li>
</ul>

<h2>Real-world Applications</h2>
<p>
  Tiptap, React, and Next.js can power various applications:
</p>
<ul>
  <li>Content Management Systems (CMS)</li>
  <li>Collaborative document editing platforms</li>
  <li>In-browser IDEs and code editors</li>
  <li>Interactive educational tools</li>
</ul>

<iframe 
   width="560" 
   height="315" 
   src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
></iframe>

<h2>Comparison of Rich Text Editors</h2>
<p>When choosing a rich text editor, it's important to compare different options based on their features, flexibility, and ecosystem support. The table below compares Tiptap, TinyMCE, and CKEditor.</p>
<table>
  <colgroup>
    <col style="width: 180px" />
    <col style="width: 100px" />
    <col style="width: 100px" />
    <col style="width: 100px" />
  </colgroup>
  <tbody>
    <tr>
      <th colwidth="180"><p>Feature</p></th>
      <th colwidth="100"><p style="text-align: center">Tiptap</p></th>
      <th colwidth="100"><p style="text-align: center">TinyMCE</p></th>
      <th colwidth="100"><p style="text-align: center">CKEditor</p></th>
    </tr>
    <tr>
      <td colwidth="180"><p>Headless</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">❌</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
    </tr>
      <tr>
      <td colwidth="180"><p>React & Vue Support</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
    </tr>
   </tr>
      <tr>
      <td colwidth="180"><p>Extensibility</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">⚠️</p></td>
      <td colwidth="100"><p style="text-align: center">⚠️</p></td>
    </tr>
    <tr>
      <td colwidth="180"><p>Collaborative</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
    </tr>
   <tr>
      <td colwidth="180"><p>Markdown Support</p></td>
      <td colwidth="100"><p style="text-align: center">⚠️</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
    </tr>
   <tr>
      <td colwidth="180"><p>Lighweight</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">⚠️</p></td>
      <td colwidth="100"><p style="text-align: center">⚠️</p></td>   
    </tr>
    <tr>
      <td colwidth="180"><p>Open Source</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
      <td colwidth="100"><p style="text-align: center">❌</p></td>
      <td colwidth="100"><p style="text-align: center">✅</p></td>
    </tr>
  </tbody>
</table>


<h2>Conclusion</h2>
<p>
  Tiptap, combined with React and Next.js, offers a powerful solution for building rich text editors. Its extensibility, performance optimization capabilities, and support for collaborative editing make it an excellent choice for a wide range of web applications.
</p>

<h2>Resources</h2>
<ul>
  <li><a href="https://tiptap.dev/docs">Tiptap Documentation</a></li>
  <li><a href="https://nextjs.org/docs">Next.js Documentation</a></li>
  <li><a href="https://react.dev/">React Documentation</a></li>
  <li><a href="https://prosemirror.net/">ProseMirror Documentation</a></li>
</ul>
`;

export const mock = {
  title,
  content,
  wordCount: 483,
  cover: "https://res.cloudinary.com/dmhzdv5kf/image/upload/v1733364957/shk91N6yUj_zkms92.jpg",
  author: "Yahir Adolfo",
  createdAt: "Jan, 02 2025",
};
