'use client';

type Props = {
  onSignIn: () => Promise<void>;
};

const SignIn = ({ onSignIn }: Props) => {
  return (
    <form action={onSignIn}>
      <button type="submit">Sign In</button>
    </form>
  );
};

export default SignIn;

