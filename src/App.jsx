import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import './App.css';

const files = {
  'index.html': {
    name: 'index.html',
    language: 'html',
    value: '<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <h1>Hello World</h1>\n    <script src="script.js"></script>\n  </body>\n</html>',
  },
  'style.css': {
    name: 'style.css',
    language: 'css',
    value: 'body { background-color: #282c34; color: white; }',
  },
  'script.js': {
    name: 'script.js',
    language: 'javascript',
    value: 'console.log(\'Hello, world!\');',
  },
};

function App() {
  const [fileName, setFileName] = React.useState('index.html');
  const [iframeSrcDoc, setIframeSrcDoc] = React.useState('');
  const [refresh, setRefresh] = React.useState(false);

  const file = files[fileName];
  const iframeRef = useRef(null);

  const runCode = () => {
    const iframe = iframeRef.current;
    const html = files['index.html'].value;
    const css = files['style.css'].value;
    const js = files['script.js'].value;

    const combinedCode = `<style>${css}</style>${html}<script>${js}</script>`;
    iframe.srcdoc = combinedCode;
  };

  React.useEffect(() => {
    runCode();
    console.log(files);
  }, [fileName, refresh]);

  return (
    <>
      <Split
        className='split'
      >
        <div>
          <h3 style={{ textAlign: 'center' }}>Index.html</h3>
          <Editor
            defaultLanguage="html"
            defaultValue="// some comment"
            value={file.value}
            onChange={(value) => {
              files[fileName].value = value;
              setRefresh(!refresh);
            }}
            options={{
              minimap: { enabled: false },
            }}
          />
        </div>
        <div>
          <h3 style={{ textAlign: 'center' }}>Style.css</h3>
          <Editor
            defaultLanguage="css"
            defaultValue="// some comment"
            value={files['style.css'].value}
            onChange={(value) => {
              files['style.css'].value = value;
              setRefresh(!refresh);
            }}
            options={{
              minimap: { enabled: false },
            }}
          />
        </div>
        <div>
          <h3 style={{ textAlign: 'center' }}>Script.js</h3>
          <Editor
            defaultLanguage="javascript"
            defaultValue="// some comment"
            value={files['script.js'].value}
            onChange={(value) => {
              files['script.js'].value = value;
              setRefresh(!refresh);
            }}
            options={{
              minimap: { enabled: false },
            }}
          />
        </div>
      </Split>
      <h2 style={{ textAlign: 'center', marginTop: '50px', marginBottom: '10px' }}>Output :</h2>
      <iframe
        title="output"
        ref={iframeRef}
        srcDoc={iframeSrcDoc}
        height='400px'
        width="100%"
        style={{ border: 'none' }
        }
      />
    </>
  );
}

export default App;
