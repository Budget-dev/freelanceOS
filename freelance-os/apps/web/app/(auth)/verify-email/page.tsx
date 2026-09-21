import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification link to your email address. Please click the link to verify your account.
          </p>
        </div>
        <div className="mt-4">
          <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
