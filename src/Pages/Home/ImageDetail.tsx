import React, { useState } from 'react';
import Avatar from '../../Components/Avatar';
import { API_URL } from '../../global';

const ImageDetail: React.FC = () => {
  const [image,setImage] = useState<string>((new URLSearchParams(window.location.search)).get('img')??"");

	const handleSearchChange = () => {
		let img = (new URLSearchParams(window.location.search)).get('img')??""
    setImage(img)
  }

	const hasMountedRef = React.useRef(false);
  React.useEffect(()=>{
    window.addEventListener('popstate', handleSearchChange);

    if (hasMountedRef.current) return () => {window.removeEventListener('popstate', handleSearchChange);};
    hasMountedRef.current = true;

    return () => {window.removeEventListener('popstate', handleSearchChange);};
  },[])


	return (
		<div className="flex h-screen items-center justify-center">
			<Avatar className='' src={(image.startsWith('http') ? "" : API_URL+"/image/")+(image?image:"404notfound")} alt="image" />
		</div>
	);
};

export default ImageDetail;
