'use client';

/* eslint-disable @next/next/no-img-element */
import { getTextFromDataUrl } from '@ai-sdk/ui-utils';
import { useChat } from 'ai/react';
import { useRef, useState } from 'react';
import { CircleFadingPlus } from 'lucide-react'
import ReactMarkdown from 'react-markdown';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, isLoading } =
    useChat({
      api: '/api/chat',
    });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto p-2">
        <div className="flex flex-col gap-2 max-w-xl items-start justify-center w-full mx-auto">
          {messages.map(message => (
            <div key={message.id} className="flex flex-row gap-2">
              <div className="w-24 text-zinc-500 flex-shrink-0">{`${message.role}: `}</div>

              <div className="flex flex-col gap-2">
                <ReactMarkdown className="prose prose-sm">{message.content}</ReactMarkdown>

                <div className="flex flex-row gap-2">
                  {message.experimental_attachments?.map((attachment, index) =>
                    attachment.contentType?.includes('image/') ? (
                      <img
                        key={`${message.id}-${index}`}
                        className="w-40 rounded-md"
                        src={attachment.url}
                        alt={attachment.name}
                      />
                    ) : attachment.contentType?.includes('text/') ? (
                      <div key={`${message.id}-${index}`} className="w-32 h-24 rounded-md text-xs ellipsis overflow-hidden p-2 text-zinc-500 border">
                        {getTextFromDataUrl(attachment.url)}
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2 bg-white">
        <form
          onSubmit={event => {
            handleSubmit(event, {
              experimental_attachments: files,
            });
            setFiles(undefined);

            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="flex flex-col gap-2 w-full"
        >
          <div className="flex flex-row gap-2 items-start max-w-xl w-full mx-auto my-2">
            {files
              ? Array.from(files).map(attachment => {
                const { type } = attachment;

                if (type.startsWith('image/')) {
                  return (
                    <div key={attachment.name}>
                      <img
                        className="w-24 rounded-md"
                        src={URL.createObjectURL(attachment)}
                        alt={attachment.name}
                      />
                      <span className="text-sm text-zinc-500">
                        {attachment.name}
                      </span>
                    </div>
                  );
                } else if (type.startsWith('text/')) {
                  return (
                    <div
                      key={attachment.name}
                      className="w-24 text-zinc-500 flex-shrink-0 text-sm flex flex-col gap-1"
                    >
                      <div className="w-16 h-20 bg-zinc-100 rounded-md" />
                      {attachment.name}
                    </div>
                  );
                }
              })
              : ''}
          </div>
          <div
            className='flex flex-row gap-2 bg-zinc-100 rounded-xl p-2 items-center mx-auto w-full max-w-xl'
          >
            <input
              name='file'
              type="file"
              onChange={event => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
              className='hidden'
            />
            <label
              className="text-zinc-500 mx-2 hover:text-zinc-600 cursor-pointer"
              htmlFor="file"
              onClick={() => fileInputRef.current?.click()}
              // drag and drop
              onDragOver={event => {
                event.preventDefault();
              }}
              onDrop={event => {
                event.preventDefault();
                if (event.dataTransfer.files) {
                  setFiles(event.dataTransfer.files);
                }
              }}
            >
              <CircleFadingPlus />
            </label>
            <input
              value={input}
              placeholder="Send message..."
              onChange={handleInputChange}
              className="bg-zinc-100 w-full p-2 rounded-xl focus:ring-0 focus:outline-none"
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
