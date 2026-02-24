import Link from 'next/link';

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-lg border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Registro pendiente de migración
        </h1>
        <p className="mt-2 text-sm text-body">
          Volver al inicio de sesión.
        </p>
        <Link
          href="/auth/signin"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-white"
        >
          Ir a Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;
