'use client';

type Props = {
  onSignOut: () => Promise<void>;
};

const SignOut = ({ onSignOut }: Props) => {
  return (
    <form action={onSignOut}>
      <button type="submit">Sign Out</button>
    </form>
  );
};

export default SignOut;

