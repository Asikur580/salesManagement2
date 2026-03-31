import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
    value, 
    onChange, 
    placeholder = 'Enter description...', 
    className = '' 
}) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean'],
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link',
    ];

    return (
        <div className={`rich-text-editor bg-white rounded-md border border-input ${className}`}>
            <ReactQuill 
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="min-h-[200px]"
            />
            <style>{`
                .ql-container.ql-snow {
                    border: none !important;
                    font-size: 14px;
                    min-height: 200px;
                }
                .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid hsl(var(--border)) !important;
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    background: hsl(var(--muted) / 0.5);
                }
                .ql-editor {
                    min-height: 200px;
                }
                .ql-editor.ql-blank::before {
                    color: hsl(var(--muted-foreground));
                    font-style: normal;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
