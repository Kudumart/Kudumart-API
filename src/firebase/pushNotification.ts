import firebase from "firebase-admin";

const serviceAccount = JSON.parse(
	Buffer.from(
		process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string,
		"base64",
	).toString("utf8"),
);

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
});

type FirebaseMessage = {
	token: string;
	data?: { [key: string]: string };
	notification?: {
		title: string;
		body: string;
	};
};

type FirebaseMulticastMessage = {
	tokens: string[];
	data?: { [key: string]: string };
	notification?: {
		title: string;
		body: string;
	};
};

type FirebaseTopicMessage = {
	topic: string;
	data?: { [key: string]: string };
	notification?: {
		title: string;
		body: string;
	};
};

// Send push notification
export async function sendPushNotification(message: FirebaseMessage) {
	return await firebase
		.messaging()
		.send(message)
		.then((response) => {
			console.log("Message sent successfully.");
			return response;
		})
		.catch((error) => {
			console.log("Error occurred:", error);
		});
}

/**
 * Verify that a token is valid
 * @param {*} token
 * @returns
 */
export async function verifyToken(token: string) {
	return firebase
		.auth()
		.verifyIdToken(token)
		.then((response) => {
			// Token is valid
			console.log(response);
			return response;
		})
		.catch((error) => {
			// Token is invalid
			console.log("Error occurred:", error);
			throw error;
		});
}

// Send push notification to multiple devices
export async function sendPushNotificationMultiple(
	message: FirebaseMulticastMessage,
) {
	return await firebase
		.messaging()
		.sendEachForMulticast(message)
		.then((response) => {
			console.log("Message sent to devices successfully.");
			return response;
		})
		.catch((error) => {
			console.log("Error occurred:", error);
			console.error(error);
		});
}

// Send push notification to multiple devices
export async function sendPushNotificationSingle(message: FirebaseMessage) {
	return await firebase
		.messaging()
		.send(message)
		.then((response) => {
			console.log("Message sent to device successfully.");
			return response;
		})
		.catch((error) => {
			console.log("Error occurred:", error);
			console.error(error);
		});
}

export async function sendPushNotificationToTopic(
	message: FirebaseTopicMessage,
) {
	return await firebase
		.messaging()
		.send(message)
		.then((response) => {
			console.log("Message sent to topic successfully.");
			return response;
		})
		.catch((error) => {
			console.log("Error occurred:", error);
			console.error(error);
		});
}
