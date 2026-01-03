import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
const StoryModal = ({setShowModal,fetchStories}) => {

  const bgColors = [ '#4f46e5', '#7c3aed', '#db2777', '#e11d48', '#ca8a04', '#0d9488' ];
 const [mode, setMode] = useState('text');
 const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState(bgColors[0]);
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }


  return (
    <div className='fixed inset-0 z-110 min-h-screen bg-black/80 flex blackdrop-blur text-white items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='items-center justify-between flex mb-4 text-center'>
          <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
            <ArrowLeft/>
          </button>
          <h2 className='text-lg font-semibold'>
            Create Story
          </h2>
          <span className='w-10'></span>
        </div>
        <div className='rounded-lg h-96 flex items-center justify-center relative' style={{backgroundColor:bgColor}}>
          {
            mode === 'text' && (
              <textarea
              value={text}
              onChange={(e) => setText(e.target.value)} 
              placeholder="Share your thoughts. What's on your mind?"
              className='w-full h-full bg-transparent resize-none focus:outline-none p-6 text-white text-lg'
              />
            )
          }
          {
            mode === 'media' && previewUrl && (
              media?.type.startsWith('image/') ?(
                <img src={previewUrl} alt="" className='max-h-full object-contain'/>
              ):(
                <video src={previewUrl} controls className=' max-h-full object-contain'/>
              )
            )
          }

        </div>
        <div className='mt-4 gap-2 flex '>
          {
            bgColors.map((color)=>(
              <button key={color} style={{backgroundColor: color}} className="w-8 h-8 rounded-full cursor-pointer ring" onClick={() => setBgColor(color)} />
            ))
          }

        </div>

      </div>
    </div>
  )
}

export default StoryModal
