function urlsafeBase64ToBinary(urlsafeBase64) {
	const base64 = urlsafeBase64.replace(/-/g, '+').replace(/_/g, '/');
	const raw = window.atob(base64);
	const binary = new Uint8Array(raw.length);

	for (let i = 0, len = binary.length; i < len; i++) {
		binary[i] = raw.charCodeAt(i);
	}

	return binary;
}

const arrayBufferToBase64 = (arrayBuffer) => {
	const binary = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
	return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
};

const registWebPush = () => {
	if (!navigator.serviceWorker) {
		return;
	}

	navigator.serviceWorker.register("./serviceWorker.js")
		.then(() => {
			console.log('Registering Service Worker is successful.');
			return navigator.serviceWorker.ready;
		})
		.then(registration => {
			console.log(registration);
			console.log("ok");
			return fetch('/api/webpush/get', {
				method : 'GET',
				headers: new Headers({ 'Content-Type' : 'application/json' })
			})
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				return registration.pushManager.subscribe({
					userVisibleOnly     : true,
					applicationServerKey: urlsafeBase64ToBinary(res.publicKey)
				});
			}).catch((error) => {
				console.dir(error);
				console.log('Fetching public key failed.');
			});
		})
		.then(subscription => {
			const subscribeOption = {
				"endpoint": subscription.endpoint,
				"authkey": arrayBufferToBase64(subscription.getKey('auth')),
				"pkey": arrayBufferToBase64(subscription.getKey('p256dh'))
			};
			
			fetch("/api/webpush/subscribe", {
				method: "POST",
				headers: new Headers({ "Content-Type": "application/json"}),
				body: JSON.stringify(subscribeOption)
			})
			.then(res => res.json())
			.then(json => console.log(json));
		})

}



Notification.requestPermission().then((permission) => {
	switch (permission) {
		case 'granted':
			console.log('Web Push is permitted.');
			registWebPush();
			break;
		case 'denied':
			window.alert('Please permit web push.');
			break;
		case 'default':
		default:
			break;
	}
});
