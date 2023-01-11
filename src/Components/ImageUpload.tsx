import React, { useState } from 'react';
import { useMutation } from 'react-query';

function ImageUpload() {
	const [image, setImage] = useState<File | null>(null);

	const uploadImage = useMutation((image: File) => {
		const formData = new FormData();
		formData.append('image', image);

		return fetch('/upload', {
			method: 'POST',
			body: formData,
		});
	});

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setImage(event.target.files?.[0] || null);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (image) {
			uploadImage.mutate(image);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="image">
				<input type="file" id="image" onChange={handleChange} />
				<button type="button">Browse</button>
			</label>
			<button type="submit">Upload</button>
		</form>
	);
}

export default ImageUpload;
