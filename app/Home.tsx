'use client'

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { useRef, useState, useEffect } from 'react'

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [video, setVideo] = useState<File | null>()
  const [processing, setProcessing] = useState(false)
  const ffmpegRef = useRef(new FFmpeg())
  const gifRef = useRef<HTMLImageElement | null>(null)
  const messageRef = useRef<HTMLParagraphElement | null>(null)

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message
      console.log(message);
    })
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    })
    setLoaded(true)
  }

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current
    setProcessing(true);
    if (video){
        try {
            await ffmpeg.writeFile('input.mp4', await fetchFile(video))
            await ffmpeg.exec(['-i', 'input.mp4', 'output.gif'])
            const data = (await ffmpeg.readFile('output.gif')) as any
            if (gifRef.current)
              gifRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }))
        } catch {
            console.error("The following error occured while transcoding: ", Error)
        } finally {
            setProcessing(false)
        }
    }
  }

  useEffect(() => {
        load();
  }, []);

  return loaded ? (
    //heroSection
    <div className="w-screen h-screen flex justify-center items-center">
        <div className='flex-col w-fit h-fit'>
            <h1 className='text-center text-3xl text-gray-300 font-semibold'>Video to GiF</h1>
            <br/>
            
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="file_input">
                Upload file
            </label>
            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
                aria-describedby="file_input_help" 
                id="file_input" 
                type="file"
                accept='video/*'
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">
                SVG, PNG, JPG or GIF (MAX. 800x400px).
            </p>
            <video
                controls
                width={"250"}
                src={video ? URL.createObjectURL(video) : URL.createObjectURL(new Blob())}
            ></video>
            <br />
            
            <button
                onClick={transcode}
                disabled={processing}
                type="button"
                className="text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
                {processing ? ('Processing...') : ('Process Video')}
            </button>
            <p className="text-center" ref={messageRef}></p>
            <br />

            <img src="" ref={gifRef} alt="" width="250"/>
        </div>
    </div>
  ) : (
    //loadingPage
    <div>
    <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
     <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
    </svg>
    Loading...
    </div>
  )
}