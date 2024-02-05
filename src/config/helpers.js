import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export const getRandomCode = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

export const getUniqueCode = async () => {
    // Check for document with the generated code
    let code = getRandomCode(6);
    const codeCollectionRef = collection(db, "code");
    const q = query(codeCollectionRef);
    const querySnapshot = await onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.id === code) {
                code = getRandomCode(6);
            }
        });
    });
    return code;
};

