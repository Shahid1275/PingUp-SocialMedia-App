import React, { useEffect, useState } from 'react'
import { dummyStoriesData } from '../assets/assets';
import { Plus } from 'lucide-react';
import moment from 'moment'
import StoryModal from './StoryModal';
const StoriesBar = () => {
    const [stories, setStories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [viewStory, setViewStory] = useState(null);
    const fetchSories = async () =>{
       setStories(dummyStoriesData)
    }
    useEffect(()=>{
        fetchSories();
    },[])
  return (
    <div className='w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>
            <div className='flex gap-4 pb-5 '>
            {/* add story card */}
        <div onClick={() => setShowModal(true)} className='rounded-lg shadow-sm min-w-[120px] w-[120px] h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white '>
  <div className='h-full flex-col flex justify-center items-center p-4'>
   <div className='w-10 h-10 flex bg-indigo-500 rounded-full items-center justify-center mb-3'>
<Plus className='w-5 h-5 text-white'/>
   </div>
   <h1 className='text-sm text-slate-700 font-medium text-center'>Create Story</h1>
  </div>
            </div>
            {/* //story cards */}
{
    stories.map((story, index)=>(
        <div key={index} className={`relative rounded-lg shadow min-w-[120px] w-[120px] h-40 cursor-pointer hover:shadow-lg 
        transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95`}>
            <img src={story.user.profile_picture} alt="this is the user story" className='absolute w-8 h-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow'/>
            <p className='absolute top-[4.5rem] left-3 text-white/60 text-sm truncate max-w-[6rem]'>{story.content}</p>
            <p className='text-white absolute bottom-1 right-2 z-10 text-xs'>{moment(story.createdAt).fromNow()}</p>
            {
                story.media_type !== 'text' && (
                    <div className='absolute inset-0 z-1 rounded-lg bg-black overflow-hidden'>
 {
                story.media_type === 'image' ?
                <img src={story.media_url} className='w-full h-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80'/> :
                <video src={story.media_url} className='w-full h-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80'/> 
            }
                    </div>
                )
            }
           
        </div>
    ))
}
        </div>
        {/* add story modal */}
      {
        showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchSories}/>
      }
    </div>
  )
}

export default StoriesBar
