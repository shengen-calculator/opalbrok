import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/functions';
import 'firebase/storage';

const config = {
    apiKey: "XXXXXXX",
    authDomain: "broker-1234.firebaseapp.com",
    databaseURL: "https://broker-1234.firebaseio.com/",
    projectId: "broker-1234",
    storageBucket: "gs://broker-1234.appspot.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

export const database = firebase.firestore();
export const auth = firebase.auth();
export const functions = firebase.functions();
export const storage = firebase.storage();