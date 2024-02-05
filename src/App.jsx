import React, { useRef } from 'react';
import Split from 'react-split';
import { db } from './config/firebase';
import { collection, addDoc, getDocs, onSnapshot, query, setDoc, doc } from 'firebase/firestore';
import { defaults } from './config/default';
import CodeEditor from './components/CodeEditor';
import { getUniqueCode } from './config/helpers';
import ShareDialog from './components/ShareDialog';

import './App.css';

const fileNames = ['index.html', 'style.css', 'script.js'];

function App() {
  const [iframeSrcDoc, setIframeSrcDoc] = React.useState('');
  const [timer, setTimer] = React.useState(null);
  const [files, setFiles] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const codeCollectionRef = collection(db, "codepens");
  const iframeRef = useRef(null);
  const codeBallId = window.location.pathname.slice(1) || null;
  const [currentDocId, setCurrentDocId] = React.useState(null);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);

  const runCode = () => {
    const iframe = iframeRef.current;
    const html = files['index.html'].value;
    const css = files['style.css'].value;
    const js = files['script.js'].value;

    const combinedCode = `<style>${css}</style>${html}<script>${js}</script>`;
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
      }
      // console.log(defaults)
      setFiles(defaults);
      setLoading(false);
      setTimeout(runCode, 2000);
    }

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
  }, []);

  const handleChange = (val, file) => {
    files[file].value = val;
    clearTimeout(timer);
    setTimer(setTimeout(runCode, 1500));
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
      // Navigate to the new URL
      window.history.pushState({}, null, `/${code}`);
    }
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
                    <h2>{file}</h2>
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
            <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', padding: '0px', height: '60px', paddingLeft: '15px', paddingRight: '15px' }}>
              <button onClick={handleSave}>Save</button>
              <h2>Output :</h2>
              <button onClick={handleShareOpen}>Share</button>
            </div>
            <iframe
              title="output"
              ref={iframeRef}
              srcDoc={iframeSrcDoc}
              height='500px'
              width="100%"
              style={{ border: 'none' }
              }
            />
            <ShareDialog open={shareDialogOpen} handleClose={handleShareClose} handleClickOpen={handleShareOpen} codeBallId={codeBallId} />
          </>
      }
    </>
  );
}

export default App;

