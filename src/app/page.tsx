import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
          COP · USD · FL
        </h1>
        <h2 className="mb-8 text-2xl font-semibold text-gray-700 md:text-3xl">
          Tus envíos, tus números, un solo lugar.
        </h2>
        <p className="mb-12 text-lg text-gray-600 md:text-xl">
          Registra ventas en pesos y deja que la conversión a dólares, florines
          y ganancias se calcule sola.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-indigo-700"
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
