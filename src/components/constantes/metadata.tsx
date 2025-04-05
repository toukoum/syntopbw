'use client';

import { useEffect } from 'react';

export const metadata = {
	title: "Synto",
	description: "AI-powered wallet",
};

export default function CustomHead() {
	useEffect(() => {
		document.title = metadata.title;

		let metaDescription = document.querySelector('meta[name="description"]');
		if (!metaDescription) {
			metaDescription = document.createElement('meta');
			metaDescription.setAttribute('name', 'description');
			document.head.appendChild(metaDescription);
		}

		metaDescription.setAttribute('content', metadata.description);
	}, []);

	return null;
}
