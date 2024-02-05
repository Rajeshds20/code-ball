import React from 'react'
import Editor from '@monaco-editor/react';

function CodeEditor(props) {
    return (
        <Editor
            height={'100%'}
            defaultLanguage={props.language}
            value={props.files[props.file].value}
            onChange={(value) => {
                props.handleChange(value, props.file);
            }}
            options={{
                minimap: { enabled: false },
            }}
        />
    )
}

export default CodeEditor;
