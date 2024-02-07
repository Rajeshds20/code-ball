import React, { useRef } from 'react';
import Split from 'react-split';
import { db } from './config/firebase';
import { collection, addDoc, getDocs, onSnapshot, query, setDoc, doc } from 'firebase/firestore';
import { defaults } from './config/default';
import CodeEditor from './components/CodeEditor';
import { getUniqueCode } from './config/helpers';
import ShareDialog from './components/ShareDialog';
import Editor from '@monaco-editor/react';
import './App.css';

const fileNames = ['index.html', 'style.css', 'script.js'];

function App() {
  const [iframeSrcDoc, setIframeSrcDoc] = React.useState('');
  const [timeId, setTimeId] = React.useState(null);
  const [files, setFiles] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const codeCollectionRef = collection(db, "codepens");
  const iframeRef = useRef(null);
  let codeBallId = window.location.pathname.slice(1) || null;
  const [currentDocId, setCurrentDocId] = React.useState(null);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [outputLog, setOutputLog] = React.useState('');

  const runCode = () => {
    const iframe = iframeRef.current;
    const html = files['index.html'].value;
    const css = files['style.css'].value;
    const js = files['script.js'].value;

    // setOutputLog('');

    const combinedCode = `
    <style>${css}</style>
    ${html}
    <script>
    function captureConsoleLog() {
      // Save the original console.log function
      var originalLog = console.log;

      // Override the console.log function
      console.log = function (message) {
          // Call the original console.log function
          // originalLog.apply(console, arguments);

          // Send the log message to the log viewer iframe using postMessage
          window.parent.postMessage('from'+message, '*');
      };
  }

  // Call the captureConsoleLog function to start capturing logs
  captureConsoleLog();
    ${js}</script>`;

    setIframeSrcDoc(combinedCode);
    iframe.srcdoc = combinedCode;
  };

  const getData = async () => {
    const querySnapshot = await getDocs(codeCollectionRef);
    console.log(querySnapshot)
  }

  React.useEffect(() => {

    const getDocWithId = () => {
      if (codeBallId) {
        // get code from firestore
        getDocs(codeCollectionRef).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // console.log(doc.data().code === codeBallId);
            if (doc.data().code === codeBallId) {
              setFiles(doc.data());
              setLoading(false);
              setTimeout(runCode, 2000);
              setCurrentDocId(doc.id);
              return;
            }
          });
        });
        // setFiles(codeFromFirestore);
      };

      // window.onload = () => {

      //   window.addEventListener('message', (event) => {
      //     setOutputLog(outputLog + event.data + '\n');
      //     console.log(event.data)
      //   });
      //   console.log('Window Loaded');
      // };

      // console.log(defaults)
      setFiles(defaults);
      setLoading(false);
      setTimeout(runCode, 2000);
      window.history.pushState({}, null, '/');
    }

    const captureLogs = (event) => {
      if (event.data && event.data.startsWith('from')) {
        setOutputLog(prev => prev + event.data.slice(4,) + '\n');
        // console.log(outputLog);
      }
    };

    window.addEventListener('message', captureLogs);

    // runCode();
    // getDocs();
    // const q = query(codeCollectionRef)
    // onSnapshot(q, (querySnapshot) => {
    //   querySnapshot.forEach((doc) => {
    //     console.log(doc.id, " => ", doc.data());
    //   });
    // });
    // getUniqueCode().then((code) => {
    //   console.log('Unique', code);
    // });

    getDocWithId();

    return () => {
      window.removeEventListener('message', captureLogs);
    }
  }, []);

  const handleChange = (val, file) => {
    files[file].value = val;
    // clearTimeout(timeId);
    // setTimeId(setTimeout(runCode, 1500));
  }

  const handleSave = async () => {
    if (codeBallId) {
      // update the document in firestore using Id
      await setDoc(doc(codeCollectionRef, currentDocId), files);
    }
    else {
      // add a new document to firestore
      const code = await getUniqueCode();
      const docRef = await addDoc(codeCollectionRef, { ...files, code });
      setCurrentDocId(docRef.id);
      codeBallId = code;
      // Navigate to the new URL
      window.history.pushState({}, null, `/${code}`);
    }
    alert('Code Saved Successfully!');
  }

  const handleShareOpen = () => {
    setShareDialogOpen(true);
  };
  const handleShareClose = () => {
    setShareDialogOpen(false);
  };

  return (
    <>
      {
        loading ? <div className="loader"></div>
          :
          <>
            <Split
              className='split'
            >
              {fileNames.map((file) => {
                return (
                  <div key={file} className='editor-container'>
                    <h2 style={{ textAlign: 'center' }}>{file}</h2>
                    <CodeEditor
                      language={files[file].language}
                      file={file}
                      files={files}
                      handleChange={handleChange}
                    />
                  </div>
                )
              })
              }
            </Split>
            <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px', height: '60px', paddingLeft: '15px', paddingRight: '15px' }}>
              <div>
                <button onClick={runCode} style={{ textAlign: 'center' }}>Run</button>
                <button onClick={handleSave}>Save</button>
              </div>
              <h2>Output :</h2>
              <button onClick={handleShareOpen}>Share</button>
            </div>
            <Split
              className='split'
            // [0.8,0.2]
            ><iframe
                title="output"
                ref={iframeRef}
                srcDoc={iframeSrcDoc}
                height='500px'
                width="100%"
                style={{ border: 'none' }
                }
              />
              <div style={{ position: 'relative' }}>
                <Editor
                  height={'100%'}
                  defaultLanguage={'plaintext'}
                  value={outputLog}
                  options={{
                    minimap: { enabled: false },
                    readOnly: true
                  }}
                />
                <button
                  style={{ width: '80px', height: '30px', padding: '0px', position: 'absolute', top: '0px', right: '0px' }}
                  onClick={() => {
                    setOutputLog('');
                  }}>Clear</button>
              </div>
            </Split>
            <ShareDialog open={shareDialogOpen} handleClose={handleShareClose} handleClickOpen={handleShareOpen} codeBallId={codeBallId} />
          </>
      }
    </>
  );
}

export default App;

