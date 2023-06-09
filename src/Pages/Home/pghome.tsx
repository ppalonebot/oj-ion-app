import * as React from 'react';
import '../../index.css'
import { Link } from 'react-router-dom';
import { User } from '../../Entity/User/User_model';
import ConfirmRegistration from './ConfirmRegistration';
import Main from './Main';
import { MdArrowBack, MdArrowForward, MdOutgoingMail } from 'react-icons/md';
import { API_URL } from '../../global';

type Props = {
  page?:string;
}

const Home: React.FC<Props> = (props) => {
  const [userself, setUserSelf] = React.useState<User|null>(User.load())
  const [nextBtn, setNextBtn] = React.useState<boolean>(false)

  const RegistrationConfirmed = (u:User) =>{
    u.save()
    setUserSelf(u)
  }

  return (
    <>
    {
      userself? userself.isregistered? <Main user={userself} page={props.page??""}/> : 

      <ConfirmRegistration user={userself} onValid={RegistrationConfirmed}/> : 

      <div className='w-screen h-screen overflow-auto'>
        <div className='flex flex-wrap justify-center items-center overflow-auto'>
          <div className='flex flex-1 min-w-[320px] max-w-[42%] h-screen flex-col justify-center items-center'>
            <h1 className='text-center text-4xl'>PENYATU</h1>
            <p className='font-signature text-center text-xl'>Bringing people and technology together</p>
            <p className='p-4 mt-4 text-lg text-center max-w-md hidden md:block'>Introducing our revolutionary web app chat platform - the perfect solution for staying connected with friends, family, and colleagues no matter where you are in the world.</p>
            <div className='p-8 mb-4 w-full flex flex-wrap justify-center items-center gap-4 max-w-lg'>
              <Link to={process.env.PUBLIC_URL+"/login"} className="text-center flex-1 w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Log In
              </Link >
              <Link to={process.env.PUBLIC_URL+"/register"} className="text-center flex-1 w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign Up
              </Link>

              <a href={API_URL+"/google/login"} className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex flex-row justify-center items-center gap-3">
                <span><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" data-darkreader-inline-fill="" data-darkreader-inline-stroke=""><path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"></path></svg></span>
                <span>Sign In with Google</span>
              </a>
            </div>
          </div>
          
          <div className='relative flex flex-1 min-w-[320px] h-screen flex-col justify-center items-center'>
            {!nextBtn && <div className='flex flex-row items-center w-full'>
              <div className='flex flex-1 justify-center ml-2 p-4 hover:scale-110 duration-300'>
                <div className="shadow-lg hover:shadow-xl shadow-eprimary-color hover:shadow-eprimary-color relative flex flex-col bg-slate-300 rounded-2xl overflow-hidden w-[150px] h-[300px] md:w-[200px] md:h-[400px] py-2 pb-4 px-1">
                  <div className='mx-auto mb-1 w-7 h-1 bg-black rounded-full'></div>
                  <div className="bg-black flex flex-1 h-full rounded-xl">
                    <img className='w-full h-full object-cover rounded-xl' src={process.env.PUBLIC_URL+"/assets/msg.png"} alt="penyatu.com"/>
                  </div>
                </div>
              </div>
              <div className='flex flex-auto flex-col'>
                <h1 className='text-2xl sm:text-4xl py-4 text-center md:text-left'>Web Chating</h1>
                <p className='text-md mb-4 max-w-lg hidden md:block'>Say goodbye to the limitations of traditional messaging apps and hello to our game-changing web app chat platform.</p>
                <p className='mb-2'><button onClick={()=>setNextBtn(!nextBtn)} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"><span>Next</span><MdArrowForward/></button></p>
              </div>
            </div>}
            {nextBtn && <div className='flex flex-row items-center w-full'>
              <div className='flex flex-1 justify-center ml-2 p-4 hover:scale-110 duration-300'>
                <div className="shadow-lg hover:shadow-xl shadow-eprimary-color hover:shadow-eprimary-color relative flex flex-col bg-slate-300 rounded-2xl overflow-hidden w-[150px] h-[300px] md:w-[200px] md:h-[400px] py-2 pb-4 px-1">
                  <div className='mx-auto mb-1 w-7 h-1 bg-black rounded-full'></div>
                  <div className="bg-black flex flex-1 h-full rounded-xl">
                    <img className='w-full h-full object-cover rounded-xl' src={process.env.PUBLIC_URL+"/assets/vc.png"} alt="penyatu.com"/>
                  </div>
                </div>
              </div>
              <div className='flex flex-auto flex-col'>
                <h1 className='text-2xl sm:text-4xl py-4 text-center md:text-left'>Video Calling</h1>
                <p className='text-md mb-4 max-w-lg hidden md:block'>Our web app chat platform includes a powerful video calling feature that lets you connect face-to-face with anyone in the world. Whether you're catching up with friends, conducting virtual meetings with colleagues, or just want to see your loved ones' smiling faces, our video calling feature makes it all possible.</p>
                <p className='mb-2'><button onClick={()=>setNextBtn(!nextBtn)} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"><MdArrowBack/><span>Prev</span></button></p>
              </div>
            </div>}
            <Link to={process.env.PUBLIC_URL+"/register"} className="absolute bottom-0 block sm:hidden text-center w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-4">Sign Up</Link>
          </div>
        </div>
      </div>
    }
    </>
  );
};

export default Home;
