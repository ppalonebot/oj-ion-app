import React, { useState,useRef } from 'react';
import { User } from '../../Entity/User/User_model';
import Avatar from '../../Components/Avatar';
import { API_URL } from '../../global';
import { JsonRPC2 } from '../../lib/MyJsonRPC2';
import { useMutation } from 'react-query';
import MyDialog from '../../Components/MyDialog';
import { useNavigate } from 'react-router-dom';

type Props = {
  user:User;
  isLoading:boolean;
  error:unknown;
	mainRefresh: ()=>void
}

type UploadObject = {
  file:File | null;
  jwt:string;
  uid:string;
}

const AvatarDetail: React.FC<Props> = (props) => {
	const navigate = useNavigate()

	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [dialogMessage, setDialogMessage] = React.useState('Hello!');
	const [dialogTitle, setDialogTitle] = React.useState('A Title');

	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const inputRef = useRef<HTMLInputElement>(null);
	const uploadImageMutation = useMutation((input:UploadObject) => {
		const formData = new FormData();
		formData.append("image", input.file!);
		return fetch(API_URL+"/image/upload", {
			method: "POST",
			body: formData,
			headers: { 
				'Authorization': `Bearer ${input.jwt}`
			}
		}).then(res => res.json());
	},{
		onError: (error, variables, recover) => {
			console.log("Error: ", error);
			//handle error here.
		},
		onSuccess : (data) => {
			if (data.error){
				setIsDialogOpen(true)
				setDialogTitle("Error")
				setDialogMessage(data.error as string)
			}
			else{
				setTimeout(function() {
					navigate(process.env.PUBLIC_URL+'/profile')
					props.mainRefresh()
				}, 300);
			}
		}
	});

	const updateavatartokenMutation  = useMutation(
		(rpc : JsonRPC2) => fetch(API_URL+'/prf/rpc', {
			method: 'POST',
			body: JSON.stringify(rpc),
			credentials: "include",
			headers: { 
				'Content-Type': 'application/json'
			}
		}).then(res => {
			return res.json()
		}),
		{
			onSuccess: (data,v ,ctx) => {
				if (data.result !== null){
					console.log(selectedFile)
					if (selectedFile !== null) {
						let o = data.result as UploadObject
						o.file = selectedFile
						console.log(o)
						uploadImage(o)
					}
				}
				else{
					setIsDialogOpen(true)
					setDialogTitle("Error "+data.error.code)
					setDialogMessage(data.error.message)
				}
			},
			onError: (error, v, ctx) => {
				console.log(error)
				setIsDialogOpen(true)
				setDialogTitle("Info")
				setDialogMessage("Server Busy")
			}
		}
	)
	
	const getupdateavatartoken = updateavatartokenMutation.mutate
	const uploadImage = uploadImageMutation.mutate

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if(event.target.files!.length>0) {
			if (event.target.files![0]){
				setSelectedFile(event.target.files![0])
				setTimeout(function() {
					getupdateavatartoken(new JsonRPC2("GetUpdateAvatarToken",{"uid":props.user.uid}))
				}, 300);
			}
		}
	}

	const getFileImage = () =>{
		if(inputRef.current) {
			inputRef.current.value = ""
			inputRef.current.click()
		}
	}

	const toggleDialog = () => {
		setIsDialogOpen(prevState => !prevState);
	}

	return (
	<>
		<MyDialog title={dialogTitle} isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} >
			<p>{dialogMessage}</p>
		</MyDialog>
			{
					props.isLoading? <p className='text-center mt-10'>Loading...</p> :
					props.error? <p className='text-center mt-10'>Error:  {(props.error as { message: string }).message}</p> :

			<div className="flex h-screen items-center justify-center">
					<Avatar className='' src={API_URL+(props.user.avatar?props.user.avatar:"/image/404notfound")} alt={props.user.name} />
					<div className="fixed w-64 flex flex-row items-center justify-center bottom-2">
							<input ref={inputRef} className="file-input hidden" type="file" onChange={handleImageChange} />
							<button 
									className="absolute bottom-0 left-0 right-0 m-4 mx-auto bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md" 
									onClick={getFileImage}
									disabled={updateavatartokenMutation.status === 'loading' || uploadImageMutation.status === 'loading'}
							>
									Upload New Avatar
							</button>
					</div>
			</div>
			}
	</>
	);
};

export default AvatarDetail;
