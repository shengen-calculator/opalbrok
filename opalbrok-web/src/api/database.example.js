import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';

const config = {
    apiKey: "XXXXXXX",
    authDomain: "broker-1234.firebaseapp.com",
    databaseURL: "https://broker-1234.firebaseio.com/",
    projectId: "broker-1234"
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

export const database = firebase.firestore().settings( { timestampsInSnapshots: true });
export const auth = firebase.auth();
export const functions = firebase.functions();