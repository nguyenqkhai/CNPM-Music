import {FirebaseAuthTypes} from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export class Auth {
  static createProfile = async () => {
    const user = auth().currentUser;
    if (user) {
      try {
        const data = {
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          emailVerified: user.emailVerified,
          photoUrl: user.photoURL,
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        };

        await firestore().collection('users').doc(user.uid).set(data);

        console.log('User created');
      } catch (error) {
        console.log(error);
      }
    }
  };
  static updateProfile = async (user: FirebaseAuthTypes.User) => {
    try {
      const data = {
        emailVerified: user.emailVerified,
        lastSignInTime: user.metadata.lastSignInTime,
      };

      await firestore().collection('users').doc(user.uid).update(data);

      console.log('User updated');
    } catch (error) {
      console.log(error);
    }
  };
}
