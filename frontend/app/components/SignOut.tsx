'use client';

type Props = {
  onSignOut: () => Promise<void>;
};

const SignOut = ({ onSignOut }: Props) => {
  return (
    <form action={onSignOut}>
      <button
        type="submit"
        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#E5735E] transition-colors hover:bg-[#E5735E]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A45C]"
      >
        Sign out
      </button>
    </form>
  );
};

export default SignOut;
