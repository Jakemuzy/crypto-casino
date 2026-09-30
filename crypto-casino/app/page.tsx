import { getLogtoContext, signIn, signOut } from '@logto/next/server-actions';
import SignIn from './sign-in';
import SignOut from './sign-out';
import { logtoConfig } from './logto';

//import Link from 'next/link';


export default async function Home() {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

  return (
    <nav>
      {isAuthenticated ? (
        <div>
          Hello, {claims?.sub},
          <SignOut
            onSignOut={async () => {
              'use server';

              await signOut(logtoConfig);
            }}
          />
        </div>
      ) : (
        <div>
          <SignIn
            onSignIn={async () => {
              'use server';

              await signIn(logtoConfig);
            }}
          />
        </div>
      )}
    </nav>
  );
}

