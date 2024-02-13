import React, { useRef } from 'react';
import Split from 'react-split';
import { db } from './config/firebase';
import { collection, addDoc, getDocs, onSnapshot, query, setDoc, doc, updateDoc, where } from 'firebase/firestore';
import { defaults } from './config/default';
import CodeEditor from './components/CodeEditor';
import { getUniqueCode } from './config/helpers';
import ShareDialog from './components/ShareDialog';
import Editor from '@monaco-editor/react';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import './App.css';
import SavedModal from './components/SavedModal';

const fileNames = ['index.html', 'style.css', 'script.js'];

function App() {
  const [iframeSrcDoc, setIframeSrcDoc] = React.useState(`<style>*{background-color:black;color:white;text-align:center;}</style><h2>Click Run to start Coding...</h2>`);
  const [timeId, setTimeId] = React.useState(null);
  const [files, setFiles] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const codeCollectionRef = collection(db, "codepens");
  const iframeRef = useRef(null);
  let codeBallId = window.location.pathname.slice(1) || null;
  const [currentDocId, setCurrentDocId] = React.useState(null);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [outputLog, setOutputLog] = React.useState('');
  const [darkMode, setDarkMode] = React.useState(false);
  const [savedModalOpen, setSavedModalOpen] = React.useState(false);
  const [showMiniMaps, setShowMiniMaps] = React.useState(false);

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

    const getDocWithId = async () => {
      var documentFetched = false;
      if (codeBallId) {
        // get code from firestore
        // getDocs(codeCollectionRef).then((querySnapshot) => {
        //   querySnapshot.forEach((doc) => {
        //     // console.log(doc.data().code === codeBallId);
        //     if (doc.data().code === codeBallId) {
        //       setFiles(doc.data());
        //       setLoading(false);
        //       setTimeout(runCode, 2000);
        //       setCurrentDocId(doc.id);
        //       return;
        //     }
        //   });
        // });

        const codeBallQuery = query(collection(db, "codepens"), where("code", "==", codeBallId));
        const codeBallQuerySnapshot = await getDocs(codeBallQuery);
        codeBallQuerySnapshot.forEach((doc) => {
          setFiles(doc.data());
          setLoading(false);
          setTimeout(runCode, 2000);
          setCurrentDocId(doc.id);
          documentFetched = true;
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
      if (!documentFetched) {
        setFiles(defaults);
        setLoading(false);
        setTimeout(runCode, 2000);
        setTimeout(() => {
          if (!codeBallId) {
            window.history.pushState({}, null, '/');
          }
        }, 2000);
      }
    }

    const captureLogs = (event) => {
      if (event.data?.startsWith('from')) {
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
    if (codeBallId != null) {
      // update the document in firestore using Id
      // await updateDoc(doc(db, "codepens", currentDocId), files);
      // console.log('dvjcbruibeuire', currentDocId);
      // console.log(doc(db, "codepens", currentDocId));
      await setDoc(doc(db, "codepens", currentDocId), files);
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
    setSavedModalOpen(true);
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
              {fileNames.map((file) =>
                // <Pane minSize={50} maxSize='50%'>
                <div key={file} className={`editor-container ${darkMode ? 'dark' : 'light'}`}>
                  <h2 style={{ textAlign: 'center' }}>{file}</h2>
                  <CodeEditor
                    language={files[file].language}
                    file={file}
                    files={files}
                    handleChange={handleChange}
                    theme={darkMode}
                    showMinimaps={showMiniMaps}
                  />
                </div>
                // </Pane>
              )}
            </Split>
            <div
              style={{ textAlign: 'center', marginTop: '60px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0px', height: '60px', paddingLeft: '15px', paddingRight: '15px' }}
              className={darkMode ? 'dark' : 'light'}
            >
              <div>
                <button title='Run Code' onClick={runCode} style={{ textAlign: 'center' }}>Run</button>
                <button title='Save the Page' onClick={handleSave}>Save</button>
              </div>
              <h2>Output :</h2>
              <button title='Share the Page' onClick={handleShareOpen}>Share</button>
            </div>
            <Split
              className='split'
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
            <div
              title='Toggle Theme'
              className={`dark-mode-toggle ${darkMode ? 'dark' : 'light'}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              {
                darkMode
                  ? <NightlightRoundIcon className='dark-mode' />
                  : <LightModeIcon className='light-mode' />
              }
            </div>
            <div className='editor-actions'>
              <input className='show-minimaps' id='show-minimaps' type='checkbox' checked={showMiniMaps} onClick={() => { setShowMiniMaps(prev => !prev) }} />
              <label htmlFor='show-minimaps'>Minimaps</label>
            </div>
            {savedModalOpen && <SavedModal open={savedModalOpen} handleClose={() => { setSavedModalOpen(false) }} />}
          </>
      }
    </>
  );
}

export default App;

